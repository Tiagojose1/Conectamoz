import React from "react";

export default function Notifications() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">
          Notificações
        </h1>

        <div className="mt-5 rounded-2xl bg-white p-8 text-center">
          <p className="text-gray-500">
            Ainda não tens notificações.
          </p>
        </div>
      </div>
    </div>
  );
}