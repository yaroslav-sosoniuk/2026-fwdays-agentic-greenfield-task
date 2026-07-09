import { logout } from "@/app/login/actions";
import { prisma } from "@/lib/prisma";
import { NIGHTSTAND_PRODUCT_TYPE_NAME } from "@/lib/constants";
import { SimpleDictionarySection } from "./SimpleDictionarySection";
import { HardwareSection } from "./HardwareSection";
import { StandardSizesSection } from "./StandardSizesSection";
import { PartSpecsSection } from "./PartSpecsSection";
import { CatalogEntriesSection } from "./CatalogEntriesSection";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [colors, materials, hardwareItems, standardSizes, productType, catalogEntries] =
    await Promise.all([
      prisma.color.findMany({ orderBy: { name: "asc" } }),
      prisma.material.findMany({ orderBy: { name: "asc" } }),
      prisma.hardwareItem.findMany({ orderBy: { name: "asc" } }),
      prisma.standardSize.findMany({
        orderBy: [{ dimensionType: "asc" }, { valueCm: "asc" }],
      }),
      prisma.productType.findUniqueOrThrow({
        where: { name: NIGHTSTAND_PRODUCT_TYPE_NAME },
        include: { partSpecs: true },
      }),
      prisma.catalogEntry.findMany({
        include: { facadeColor: true, facadeMaterial: true, corpusMaterial: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Керування довідниками</h1>
        <form action={logout}>
          <button type="submit">Вийти</button>
        </form>
      </header>

      <SimpleDictionarySection
        title="Кольори"
        resourcePath="/api/colors"
        itemKey="color"
        initialItems={colors}
      />
      <SimpleDictionarySection
        title="Матеріали"
        resourcePath="/api/materials"
        itemKey="material"
        initialItems={materials}
      />
      <HardwareSection initialItems={hardwareItems} />
      <StandardSizesSection initialItems={standardSizes} />
      <PartSpecsSection initialItems={productType.partSpecs} />
      <CatalogEntriesSection initialItems={catalogEntries} />
    </main>
  );
}
