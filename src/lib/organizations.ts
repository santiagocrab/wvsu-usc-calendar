import { getPrisma } from "@/lib/prisma";

export type OrganizationDTO = {
  id: string;
  name: string;
  acronym: string;
  description: string;
  contact: string;
  website: string;
  createdAt: string;
  updatedAt: string;
};

function serialize(org: {
  id: string;
  name: string;
  acronym: string;
  description: string;
  contact: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}): OrganizationDTO {
  return {
    id: org.id,
    name: org.name,
    acronym: org.acronym,
    description: org.description,
    contact: org.contact,
    website: org.website,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
  };
}

export async function getOrganizations(): Promise<OrganizationDTO[]> {
  const prisma = getPrisma();
  const orgs = await prisma.organization.findMany({ orderBy: { name: "asc" } });
  return orgs.map(serialize);
}

export async function getOrganizationById(id: string): Promise<OrganizationDTO | null> {
  const prisma = getPrisma();
  const org = await prisma.organization.findUnique({ where: { id } });
  return org ? serialize(org) : null;
}

export async function getOrganizationByName(name: string): Promise<OrganizationDTO | null> {
  const prisma = getPrisma();
  const org = await prisma.organization.findUnique({ where: { name } });
  return org ? serialize(org) : null;
}
