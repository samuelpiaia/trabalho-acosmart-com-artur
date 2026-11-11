document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;
});

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("usuariosTableBody");

  fetch("http://localhost:3000/api/usuarios")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Erro na requisição: Status ${res.status}`);
      }
      return res.json();
    })
    .then((usuarios) => {
      tbody.innerHTML = "";

      if (usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-3.5 text-center text-slate-500">Nenhum usuário cadastrado.</td></tr>`;
        return;
      }

      usuarios.forEach((usuario) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-[#1a1e26]";

        const perfilClass =
          usuario.perfil && usuario.perfil.toLowerCase() === "admin"
            ? "text-amber-400"
            : "text-slate-300";

        const statusClass =
          usuario.status && usuario.status.toLowerCase() === "ativo"
            ? "text-emerald-400"
            : "text-red-400";

        tr.innerHTML = `
          <td class="p-3.5 font-bold text-slate-100">${usuario.nome || "-"}</td>
          <td class="p-3.5 text-blue-400">${usuario.email || "-"}</td>
          <td class="p-3.5">${usuario.senha || "-"}</td>
          <td class="p-3.5 ${perfilClass}">${usuario.perfil || "-"}</td>
          <td class="p-3.5 ${statusClass}">${usuario.status || "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar usuários:", err);
      tbody.innerHTML = `<tr><td colspan="5" class="p-3.5 text-center text-red-400">Erro ao carregar dados: ${err.message}</td></tr>`;
    });
});