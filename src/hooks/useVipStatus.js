import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

/*
=========================================================
HOOK: useVipStatus
=========================================================

Responsável por verificar:

1. Utilizador autenticado
2. Se é membro VIP
3. Data de criação da conta
4. Data de início do VIP
5. Estado de carregamento

Estrutura esperada no Firestore:

users/{uid}

Campos opcionais:

isVip: true / false
vip: true / false
vipStatus: "active"
createdAt: Timestamp
created_at: Timestamp
userCreatedAt: Timestamp

=========================================================
*/

export function useVipStatus() {
  const [isVip, setIsVip] = useState(false);
  const [userCreatedAt, setUserCreatedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (cancelado) {
          return;
        }

        /*
        ================================================
        UTILIZADOR NÃO AUTENTICADO
        ================================================
        */

        if (!user) {
          setIsVip(false);
          setUserCreatedAt(null);
          setLoading(false);
          return;
        }

        try {
          /*
          ==============================================
          DATA DE CRIAÇÃO DA CONTA

          Primeiro tentamos usar o Firebase Auth.
          ==============================================
          */

          let dataCriacao = user.metadata?.creationTime
            ? new Date(user.metadata.creationTime)
            : null;

          /*
          ==============================================
          BUSCAR PERFIL DO UTILIZADOR
          ==============================================
          */

          const userRef = doc(
            db,
            "users",
            user.uid
          );

          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const dados = userSnapshot.data();

            /*
            ----------------------------------------------
            VERIFICAR VIP
            ----------------------------------------------
            */

            const vipAtivo =
              dados.isVip === true ||
              dados.vip === true ||
              dados.vipStatus === "active" ||
              dados.subscriptionStatus === "active";

            if (!cancelado) {
              setIsVip(vipAtivo);
            }

            /*
            ----------------------------------------------
            VERIFICAR DATA DA CONTA
            ----------------------------------------------
            */

            const possiveisDatas = [
              dados.createdAt,
              dados.created_at,
              dados.userCreatedAt,
            ];

            const dataFirestore =
              possiveisDatas.find(Boolean);

            if (dataFirestore) {
              if (
                typeof dataFirestore.toDate ===
                "function"
              ) {
                dataCriacao =
                  dataFirestore.toDate();
              } else {
                const dataConvertida =
                  new Date(dataFirestore);

                if (
                  !Number.isNaN(
                    dataConvertida.getTime()
                  )
                ) {
                  dataCriacao = dataConvertida;
                }
              }
            }
          }

          /*
          ==============================================
          GUARDAR DATA
          ==============================================
          */

          if (!cancelado) {
            setUserCreatedAt(dataCriacao);
            setLoading(false);
          }
        } catch (error) {
          console.error(
            "Erro ao verificar estado VIP:",
            error
          );

          /*
          ----------------------------------------------
          EM CASO DE ERRO NÃO CONSIDERAMOS O UTILIZADOR
          COMO VIP AUTOMATICAMENTE.
          ----------------------------------------------
          */

          if (!cancelado) {
            setIsVip(false);

            /*
            Ainda podemos usar a data do Firebase Auth
            para o trial.
            */

            const dataAuth =
              user.metadata?.creationTime
                ? new Date(
                    user.metadata.creationTime
                  )
                : null;

            setUserCreatedAt(dataAuth);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      cancelado = true;
      unsubscribe();
    };
  }, []);

  return {
    isVip,
    userCreatedAt,
    loading,
  };
}

export default useVipStatus;