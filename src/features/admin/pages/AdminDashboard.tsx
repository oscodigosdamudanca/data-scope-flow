const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel de Administração</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Gerenciamento de Usuários</h2>
          <p>Placeholder para a funcionalidade de CRUD de usuários.</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Gerenciamento de Tipos de Perguntas</h2>
          <p>Placeholder para a funcionalidade de CRUD de tipos de perguntas.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;