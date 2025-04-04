"use server"

import prisma from "@/lib/prisma"
import { requireAuth } from "./auth-actions"
import { Prisma } from "@prisma/client"
import { Appointment } from "@/lib/database/types"

export async function getAppointments(date?: Date) {
  const session = await requireAuth()
  if (session.role == "admin" || session.role == "reception")
    return await prisma.appointment.findMany({
      include: {
        patient: {
          select: {
            name: true
          }
        },
        staff: {
          select: {
            name: true
          }
        }
      },
      ...(date ? {
        where: {
          date
        }
      }: {})
    })
  else return await prisma.appointment.findMany({
    include: {
      patient: {
        select: {
          name: true
        }
      },
      staff: {
        select: {
          name: true,
          user: true
        }
      }
    },
    where: {
      staff: {
        user: {
          id: session.id
        }
      },
      date: date?.toISOString()
    }
  })
}

export async function getAppointmentsByStaff(staffId: string) {
  await requireAuth()
  const appointments = await prisma.appointment.findMany({
    where: {
      staff: {
        id: staffId
      }
    },
    include: {
      patient: {
        select: {
          name: true
        }
      },
      staff: {
        select: {
          name: true
        }
      }
    }
  })
  return appointments
}

export async function addAppointment(appointment: Appointment) {
  await requireAuth((session) => session.user.role == "admin" || session.user.role == "reception")
  return await prisma.appointment.create({
    data: appointment,
    include: {
      patient: {
        select: {
          name: true
        }
      },
      staff: {
        select: {
          name: true
        }
      }
    }
  })
}

export async function deleteAppointment(id: string) {
  await requireAuth((session) => session.user.role == "admin" || session.user.role == "reception")
  return await prisma.appointment.delete({
    where: { id },
  })
}