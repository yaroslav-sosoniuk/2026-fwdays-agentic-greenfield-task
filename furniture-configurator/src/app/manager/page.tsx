import { logout } from "@/app/login/actions";
import { prisma } from "@/lib/prisma";
import { NIGHTSTAND_PRODUCT_TYPE_NAME } from "@/lib/constants";
import { ConfiguratorForm } from "./ConfiguratorForm";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const [productType, colors, materials, hardwareItems] = await Promise.all([
    prisma.productType.findUniqueOrThrow({
      where: { name: NIGHTSTAND_PRODUCT_TYPE_NAME },
    }),
    prisma.color.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.material.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.hardwareItem.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Конфігуратор виробів</h1>
        <form action={logout}>
          <button type="submit">Вийти</button>
        </form>
      </header>
      <ConfiguratorForm
        productType={{ id: productType.id, name: productType.name }}
        colors={colors}
        materials={materials}
        hardwareItems={hardwareItems}
      />
    </main>
  );
}
