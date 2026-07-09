import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ maxWidth: 360, margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h1>Furniture Configurator</h1>
      <p style={{ fontSize: 14, color: "#555" }}>
        Демо-вхід: <code>manager</code> / <code>manager123</code> (менеджер) або{" "}
        <code>admin</code> / <code>admin123</code> (адмін).
      </p>
      {error && <p style={{ color: "crimson" }}>Невірний логін або пароль.</p>}
      <form action={login} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label>
          Логін
          <input name="username" required style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            required
            style={{ display: "block", width: "100%" }}
          />
        </label>
        <button type="submit">Увійти</button>
      </form>
    </main>
  );
}
