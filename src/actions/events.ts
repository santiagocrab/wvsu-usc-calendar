"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { isAdminAuthenticated, setAdminSession, clearAdminSession, verifyPassword } from "@/lib/auth";
import { generateEventId } from "@/lib/events";

export type EventFormData = {
  title: string;
  category: string;
  host: string;
  organization: string;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  mapLink: string;
  targetParticipants: string;
  description: string;
  contactPerson: string;
  sourceFile: string;
  remarks: string;
};

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function validateEventData(data: EventFormData): string | null {
  if (!data.title?.trim()) return "Event title is required.";
  if (!data.category) return "Category is required.";
  if (!data.host?.trim()) return "Host is required.";
  if (!data.organization?.trim()) return "Organization is required.";
  if (!data.eventType) return "Event type is required.";
  if (!data.status) return "Status is required.";
  if (!data.startDate) return "Start date is required.";
  if (!data.endDate) return "End date is required.";
  if (!data.location?.trim()) return "Location is required.";
  if (data.endDate < data.startDate) return "End date cannot be before start date.";
  return null;
}

async function requireAdmin() {
  const authed = await isAdminAuthenticated();
  if (!authed) throw new Error("Unauthorized");
}

export async function loginAction(
  password: string,
  redirectTo?: string | null
): Promise<{ success: false; error: string } | void> {
  if (!process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Admin password is not configured." };
  }
  if (!verifyPassword(password)) {
    return { success: false, error: "Incorrect password. Please try again." };
  }
  await setAdminSession();
  const destination =
    redirectTo && redirectTo.startsWith("/admin") && redirectTo !== "/admin/login"
      ? redirectTo
      : "/admin";
  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  revalidatePath("/admin");
  redirect("/admin/login");
}

export async function createEvent(data: EventFormData): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await requireAdmin();
    const validationError = validateEventData(data);
    if (validationError) return { success: false, error: validationError };

    const prisma = getPrisma();
    const event = await prisma.event.create({
      data: {
        id: generateEventId(),
        title: data.title.trim(),
        category: data.category,
        host: data.host.trim(),
        organization: data.organization.trim(),
        eventType: data.eventType,
        status: data.status,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        startTime: data.startTime?.trim() ?? "",
        endTime: data.endTime?.trim() ?? "",
        location: data.location.trim(),
        mapLink: data.mapLink?.trim() ?? "",
        targetParticipants: data.targetParticipants?.trim() ?? "",
        description: data.description?.trim() ?? "",
        contactPerson: data.contactPerson?.trim() ?? "",
        sourceFile: data.sourceFile?.trim() ?? "",
        remarks: data.remarks?.trim() ?? "",
      },
    });

    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    revalidatePath("/conflicts");

    return { success: true, id: event.id };
  } catch (error) {
    console.error("createEvent error:", error);
    return { success: false, error: "Failed to create event. Please try again." };
  }
}

export async function updateEvent(
  id: string,
  data: EventFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const validationError = validateEventData(data);
    if (validationError) return { success: false, error: validationError };

    const prisma = getPrisma();
    await prisma.event.update({
      where: { id },
      data: {
        title: data.title.trim(),
        category: data.category,
        host: data.host.trim(),
        organization: data.organization.trim(),
        eventType: data.eventType,
        status: data.status,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        startTime: data.startTime?.trim() ?? "",
        endTime: data.endTime?.trim() ?? "",
        location: data.location.trim(),
        mapLink: data.mapLink?.trim() ?? "",
        targetParticipants: data.targetParticipants?.trim() ?? "",
        description: data.description?.trim() ?? "",
        contactPerson: data.contactPerson?.trim() ?? "",
        sourceFile: data.sourceFile?.trim() ?? "",
        remarks: data.remarks?.trim() ?? "",
      },
    });

    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    revalidatePath("/conflicts");

    return { success: true };
  } catch (error) {
    console.error("updateEvent error:", error);
    return { success: false, error: "Failed to update event. Please try again." };
  }
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const prisma = getPrisma();
    await prisma.event.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    revalidatePath("/conflicts");

    return { success: true };
  } catch (error) {
    console.error("deleteEvent error:", error);
    return { success: false, error: "Failed to delete event. Please try again." };
  }
}
