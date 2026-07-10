import { getPrisma } from "@/lib/prisma";
import { serializeEvent, type EventDTO } from "@/lib/events";

export async function getEvents(): Promise<EventDTO[]> {
  const prisma = getPrisma();
  const events = await prisma.event.findMany({
    orderBy: [{ startDate: "asc" }, { title: "asc" }],
  });
  return events.map(serializeEvent);
}

export async function getEventById(id: string): Promise<EventDTO | null> {
  const prisma = getPrisma();
  const event = await prisma.event.findUnique({ where: { id } });
  return event ? serializeEvent(event) : null;
}

export async function getEventStats() {
  const prisma = getPrisma();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [total, thisMonth, pending, proposed] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({
      where: {
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
    }),
    prisma.event.count({
      where: { status: { in: ["Pending Approval", "Needs Verification"] } },
    }),
    prisma.event.count({
      where: {
        OR: [
          { status: "Proposed" },
          { category: "Org/CSC Proposed Event" },
        ],
      },
    }),
  ]);

  return { total, thisMonth, pending, proposed };
}

export async function getUpcomingEvents(limit = 5): Promise<EventDTO[]> {
  const prisma = getPrisma();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = await prisma.event.findMany({
    where: { endDate: { gte: today } },
    orderBy: [{ startDate: "asc" }, { title: "asc" }],
    take: limit,
  });
  return events.map(serializeEvent);
}
