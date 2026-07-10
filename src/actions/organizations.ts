"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export type OrganizationFormData = {
  name: string;
  acronym: string;
  description: string;
  contact: string;
  website: string;
};

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
}

function validate(data: OrganizationFormData): string | null {
  if (!data.name?.trim()) return "Organization name is required.";
  return null;
}

export async function createOrganization(
  data: OrganizationFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await requireAdmin();
    const err = validate(data);
    if (err) return { success: false, error: err };
    const prisma = getPrisma();
    const org = await prisma.organization.create({
      data: {
        name: data.name.trim(),
        acronym: data.acronym?.trim() ?? "",
        description: data.description?.trim() ?? "",
        contact: data.contact?.trim() ?? "",
        website: data.website?.trim() ?? "",
      },
    });
    revalidateOrgPaths();
    return { success: true, id: org.id };
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { success: false, error: "An organization with this name already exists." };
    }
    return { success: false, error: "Failed to create organization." };
  }
}

export async function updateOrganization(
  id: string,
  data: OrganizationFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const err = validate(data);
    if (err) return { success: false, error: err };
    const prisma = getPrisma();
    await prisma.organization.update({
      where: { id },
      data: {
        name: data.name.trim(),
        acronym: data.acronym?.trim() ?? "",
        description: data.description?.trim() ?? "",
        contact: data.contact?.trim() ?? "",
        website: data.website?.trim() ?? "",
      },
    });
    revalidateOrgPaths();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update organization." };
  }
}

export async function deleteOrganization(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const prisma = getPrisma();
    await prisma.organization.delete({ where: { id } });
    revalidateOrgPaths();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete organization." };
  }
}

function revalidateOrgPaths() {
  revalidatePath("/");
  revalidatePath("/organizations");
  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/admin/organizations");
}
