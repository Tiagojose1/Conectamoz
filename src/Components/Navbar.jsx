function Navbar() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          ConectMoz
        </h1>

        <div className="flex gap-4 text-xl">
          <button title="Pesquisar">🔍</button>
          <button title="Notificações">🔔</button>
          <button title="Mensagens">💬</button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;