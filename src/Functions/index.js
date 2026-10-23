const {
  onRequest,
} = require("firebase-functions/v2/https");

const {
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");

const {
  defineSecret,
  defineString,
} = require("firebase-functions/params");

const logger =
  require("firebase-functions/logger");

const admin = require("firebase-admin");

const crypto = require("crypto");

admin.initializeApp();

const db = admin.firestore();

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const YOTI_SDK_ID = defineSecret(
  "YOTI_SDK_ID"
);

const YOTI_API_KEY = defineSecret(
  "YOTI_API_KEY"
);

const YOTI_NOTIFICATION_URL =
  defineString("YOTI_NOTIFICATION_URL");

const KONNEXVIB_RETURN_URL =
  defineString("KONNEXVIB_RETURN_URL");

/*
|--------------------------------------------------------------------------
| YOTI SANDBOX
|--------------------------------------------------------------------------
*/

const YOTI_SANDBOX_BASE =
  "https://age.yoti.com/sandbox/api/v1";

/*
|--------------------------------------------------------------------------
| CONSTANTES
|--------------------------------------------------------------------------
*/

const AGE_REQUIRED = 18;

const SESSION_TTL = 900;

/*
|--------------------------------------------------------------------------
| UTILITÁRIOS
|--------------------------------------------------------------------------
*/

function getSecretValue(secret) {
  if (!secret) {
    throw new Error(
      "Secret Yoti não configurado."
    );
  }

  return secret.value();
}

function requireAuthenticatedUser(request) {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "É necessário iniciar sessão."
    );
  }

  return request.auth.uid;
}

/*
|--------------------------------------------------------------------------
| CHAMADA HTTP PARA YOTI
|--------------------------------------------------------------------------
*/

async function yotiRequest(
  endpoint,
  options = {}
) {
  const sdkId =
    getSecretValue(YOTI_SDK_ID);

  const apiKey =
    getSecretValue(YOTI_API_KEY);

  const response = await fetch(
    `${YOTI_SANDBOX_BASE}${endpoint}`,
    {
      ...options,

      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type":
          "application/json",

        "Yoti-Sdk-Id": sdkId,

        ...(options.headers || {}),
      },
    }
  );

  const text =
    await response.text();

  let data = {};

  try {
    data = text
      ? JSON.parse(text)
      : {};
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    logger.error(
      "Yoti Sandbox error",
      {
        status: response.status,
        data,
      }
    );

    throw new Error(
      `Yoti respondeu ${response.status}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| CREATE AGE VERIFICATION SESSION
|--------------------------------------------------------------------------
|
| Chamado pelo SalaVIP.jsx.
|
*/

exports.createYotiAgeSession =
  onCall(
    {
      region: "us-central1",

      secrets: [
        YOTI_SDK_ID,
        YOTI_API_KEY,
      ],

      cors: true,
    },

    async (request) => {
      const uid =
        requireAuthenticatedUser(
          request
        );

      /*
      |--------------------------------------------------------------------------
      | PERFIL DO UTILIZADOR
      |--------------------------------------------------------------------------
      */

      const userRef =
        db.collection("users").doc(uid);

      const userSnap =
        await userRef.get();

      if (!userSnap.exists) {
        throw new HttpsError(
          "not-found",
          "Perfil do utilizador não encontrado."
        );
      }

      const userData =
        userSnap.data() || {};

      /*
      |--------------------------------------------------------------------------
      | DATA DE NASCIMENTO
      |--------------------------------------------------------------------------
      */

      const dateOfBirth =
        userData.dateOfBirth ||
        userData.birthDate ||
        userData.dataNascimento;

      if (!dateOfBirth) {
        throw new HttpsError(
          "failed-precondition",
          "A data de nascimento é obrigatória."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CRIAR ID DE REFERÊNCIA
      |--------------------------------------------------------------------------
      |
      | Não colocamos nome, telefone ou outros dados pessoais.
      |
      */

      const referenceId =
        `kv_${uid}_${Date.now()}`;

      /*
      |--------------------------------------------------------------------------
      | URL DO WEBHOOK
      |--------------------------------------------------------------------------
      */

      const notificationUrl =
        YOTI_NOTIFICATION_URL.value();

      /*
      |--------------------------------------------------------------------------
      | CALLBACK
      |--------------------------------------------------------------------------
      */

      const returnUrl =
        KONNEXVIB_RETURN_URL.value();

      /*
      |--------------------------------------------------------------------------
      | PAYLOAD YOTI
      |--------------------------------------------------------------------------
      */

      const payload = {
        type: "OVER",

        ttl: SESSION_TTL,

        age_estimation: {
          allowed: true,

          threshold:
            AGE_REQUIRED,

          level: "PASSIVE",

          retry_limit: 1,
        },

        digital_id: {
          allowed: true,

          threshold:
            AGE_REQUIRED,

          retry_limit: 1,
        },

        doc_scan: {
          allowed: true,

          threshold:
            AGE_REQUIRED,

          authenticity: "AUTO",

          level: "PASSIVE",

          retry_limit: 1,
        },

        credit_card: {
          allowed: false,

          retry_limit: 1,
        },

        mobile: {
          allowed: false,

          retry_limit: 1,
        },

        reference_id:
          referenceId,

        callback: {
          auto: true,

          url: returnUrl,
        },

        notification_url:
          notificationUrl,

        cancel_url:
          returnUrl,

        retry_enabled: true,

        resume_enabled: true,

        synchronous_checks: true,
      };

      /*
      |--------------------------------------------------------------------------
      | CRIAR SESSÃO
      |--------------------------------------------------------------------------
      */

      const result =
        await yotiRequest(
          "/sessions",
          {
            method: "POST",

            body: JSON.stringify(
              payload
            ),
          }
        );

      /*
      |--------------------------------------------------------------------------
      | GUARDAR SESSÃO
      |--------------------------------------------------------------------------
      */

      const sessionId =
        result.id;

      if (!sessionId) {
        throw new HttpsError(
          "internal",
          "Yoti não devolveu o ID da sessão."
        );
      }

      await db
        .collection("ageVerificationSessions")
        .doc(sessionId)
        .set({
          uid,

          provider: "yoti",

          environment: "sandbox",

          sessionId,

          referenceId,

          status:
            result.status ||
            "PENDING",

          createdAt:
            admin.firestore.FieldValue.serverTimestamp(),

          expiresAt:
            result.expires_at || null,
        });

      /*
      |--------------------------------------------------------------------------
      | ESTADO VIP
      |--------------------------------------------------------------------------
      */

      await db
        .collection("vip")
        .doc(uid)
        .set(
          {
            verificationStatus:
              "pending",

            ageVerified: false,

            verificationProvider:
              "yoti",

            verificationEnvironment:
              "sandbox",

            currentSessionId:
              sessionId,

            updatedAt:
              admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          }
        );

      /*
      |--------------------------------------------------------------------------
      | URL PARA ABRIR YOTI
      |--------------------------------------------------------------------------
      */

      const sdkId =
        getSecretValue(
          YOTI_SDK_ID
        );

      const yotiUrl =
        `https://age.yoti.com?sessionId=${encodeURIComponent(
          sessionId
        )}&sdkId=${encodeURIComponent(
          sdkId
        )}`;

      return {
        success: true,

        provider: "yoti",

        environment: "sandbox",

        sessionId,

        status:
          result.status ||
          "PENDING",

        expiresAt:
          result.expires_at ||
          null,

        url: yotiUrl,
      };
    }
  );

/*
|--------------------------------------------------------------------------
| GET SESSION RESULT
|--------------------------------------------------------------------------
|
| Permite ao frontend consultar o resultado depois
| do retorno do Yoti.
|
*/

exports.getYotiAgeResult =
  onCall(
    {
      region: "us-central1",

      secrets: [
        YOTI_SDK_ID,
        YOTI_API_KEY,
      ],

      cors: true,
    },

    async (request) => {
      const uid =
        requireAuthenticatedUser(
          request
        );

      const sessionId =
        request.data?.sessionId;

      if (!sessionId) {
        throw new HttpsError(
          "invalid-argument",
          "sessionId é obrigatório."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | LOCALIZAR SESSÃO
      |--------------------------------------------------------------------------
      */

      const sessionRef =
        db
          .collection(
            "ageVerificationSessions"
          )
          .doc(sessionId);

      const sessionSnap =
        await sessionRef.get();

      if (!sessionSnap.exists) {
        throw new HttpsError(
          "not-found",
          "Sessão de verificação não encontrada."
        );
      }

      const session =
        sessionSnap.data();

      /*
      |--------------------------------------------------------------------------
      | IMPEDIR ACESSO A SESSÃO DE OUTRO UTILIZADOR
      |--------------------------------------------------------------------------
      */

      if (session.uid !== uid) {
        throw new HttpsError(
          "permission-denied",
          "Esta sessão não pertence ao utilizador."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CONSULTAR YOTI
      |--------------------------------------------------------------------------
      */

      const result =
        await yotiRequest(
          `/sessions/${encodeURIComponent(
            sessionId
          )}/result`,
          {
            method: "GET",
          }
        );

      /*
      |--------------------------------------------------------------------------
      | PROCESSAR RESULTADO
      |--------------------------------------------------------------------------
      */

      const status =
        result.status;

      const passed =
        status === "COMPLETE" &&
        (
          result.result === true ||
          result.age >= AGE_REQUIRED ||
          result.method === "DIGITAL_ID" ||
          result.method === "DOC_SCAN"
        );

      /*
      |--------------------------------------------------------------------------
      | IMPORTANTE
      |--------------------------------------------------------------------------
      |
      | Em produção vamos aplicar regras mais rigorosas
      | conforme o método de verificação escolhido.
      |
      */

      await saveVerificationResult({
        uid,
        sessionId,
        result,
        passed,
      });

      return {
        success: true,

        sessionId,

        status,

        ageVerified:
          passed,

        provider:
          "yoti",

        environment:
          "sandbox",
      };
    }
  );

/*
|--------------------------------------------------------------------------
| WEBHOOK YOTI
|--------------------------------------------------------------------------
|
| Yoti chama este endpoint.
|
*/

exports.yotiAgeWebhook =
  onRequest(
    {
      region: "us-central1",

      cors: false,
    },

    async (req, res) => {
      /*
      |--------------------------------------------------------------------------
      | SOMENTE POST
      |--------------------------------------------------------------------------
      */

      if (req.method !== "POST") {
        res
          .status(405)
          .send("Method Not Allowed");

        return;
      }

      try {
        const notification =
          req.body || {};

        logger.info(
          "Yoti notification recebida",
          {
            session:
              notification.id ||
              notification.session_key,
          }
        );

        /*
        |--------------------------------------------------------------------------
        | SESSION ID
        |--------------------------------------------------------------------------
        */

        const sessionId =
          notification.id ||
          notification.session_key;

        if (!sessionId) {
          res
            .status(400)
            .json({
              error:
                "Session ID ausente.",
            });

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | LOCALIZAR SESSÃO
        |--------------------------------------------------------------------------
        */

        const sessionRef =
          db
            .collection(
              "ageVerificationSessions"
            )
            .doc(sessionId);

        const sessionSnap =
          await sessionRef.get();

        if (!sessionSnap.exists) {
          logger.warn(
            "Sessão Yoti não encontrada.",
            {
              sessionId,
            }
          );

          /*
          | Ainda respondemos 200 para evitar
          | retries infinitos durante desenvolvimento.
          */

          res
            .status(200)
            .json({
              received: true,
              matched: false,
            });

          return;
        }

        const session =
          sessionSnap.data();

        /*
        |--------------------------------------------------------------------------
        | RESULTADO
        |--------------------------------------------------------------------------
        */

        const passed =
          notification.state ===
            "COMPLETE" &&
          notification.result === true &&
          (
            Number(
              notification.age
            ) >= AGE_REQUIRED ||
            notification.method ===
              "DIGITAL_ID" ||
            notification.method ===
              "DOC_SCAN"
          );

        /*
        |--------------------------------------------------------------------------
        | ATUALIZAR SESSÃO
        |--------------------------------------------------------------------------
        */

        await sessionRef.set(
          {
            status:
              notification.state ||
              "UNKNOWN",

            lastNotification:
              notification,

            updatedAt:
              admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        /*
        |--------------------------------------------------------------------------
        | ATUALIZAR VIP
        |--------------------------------------------------------------------------
        */

        await saveVerificationResult({
          uid: session.uid,

          sessionId,

          result:
            notification,

          passed,
        });

        /*
        |--------------------------------------------------------------------------
        | ACK YOTI
        |--------------------------------------------------------------------------
        */

        res.status(200).json({
          received: true,
        });
      } catch (error) {
        logger.error(
          "Erro no webhook Yoti",
          error
        );

        /*
        | Durante desenvolvimento:
        | 500 permite ao Yoti tentar novamente.
        */

        res.status(500).json({
          error:
            "Webhook processing failed",
        });
      }
    }
  );

/*
|--------------------------------------------------------------------------
| GUARDAR RESULTADO DE VERIFICAÇÃO
|--------------------------------------------------------------------------
*/

async function saveVerificationResult({
  uid,
  sessionId,
  result,
  passed,
}) {
  const vipRef =
    db
      .collection("vip")
      .doc(uid);

  const sessionRef =
    db
      .collection(
        "ageVerificationSessions"
      )
      .doc(sessionId);

  /*
  |--------------------------------------------------------------------------
  | RESULTADO NORMALIZADO
  |--------------------------------------------------------------------------
  */

  const normalizedStatus =
    passed
      ? "verified"
      : (
          result?.status ===
          "PENDING"
            ? "pending"
            : "rejected"
        );

  /*
  |--------------------------------------------------------------------------
  | VIP
  |--------------------------------------------------------------------------
  */

  await vipRef.set(
    {
      ageVerified:
        passed,

      verificationStatus:
        normalizedStatus,

      verificationProvider:
        "yoti",

      verificationEnvironment:
        "sandbox",

      currentSessionId:
        sessionId,

      verifiedAt:
        passed
          ? admin.firestore.FieldValue.serverTimestamp()
          : null,

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  /*
  |--------------------------------------------------------------------------
  | SESSÃO
  |--------------------------------------------------------------------------
  */

  await sessionRef.set(
    {
      finalResult:
        passed
          ? "PASS"
          : "FAIL",

      status:
        result?.status ||
        "COMPLETE",

      resultReceivedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

exports.health =
  onRequest(
    {
      region: "us-central1",
    },
    async (req, res) => {
      res.status(200).json({
        success: true,

        service:
          "KonnexVib Yoti Backend",

        provider:
          "Yoti",

        environment:
          "sandbox",

        timestamp:
          new Date().toISOString(),
      });
    }
  );