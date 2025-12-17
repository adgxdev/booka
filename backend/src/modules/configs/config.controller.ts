import { NextFunction, Request, Response } from "express";
import prisma from "../../configs/prisma";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";
import { UpdateConfigSchema, UpdateConfigInput } from "./config.type";

// Get all config values (any admin)
export const getAllConfigs = async (req: Request, res: Response, next: NextFunction) => {
  const configs = await prisma.config.findMany({
    orderBy: { key: "asc" },
  });

  return APIResponse.success(res, "Configs retrieved successfully", configs);
};

// Get a specific config by key (any admin)
export const getConfigByKey = async (req: Request, res: Response, next: NextFunction) => {
  const { key } = req.params;

  const config = await prisma.config.findUnique({
    where: { key },
  });

  if (!config) {
    throw APIError.NotFound("Config not found");
  }

  return APIResponse.success(res, "Config retrieved successfully", config);
};


// Update or create a config value (Super Admin only)

export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  const validatedData = UpdateConfigSchema.parse(req.body);
  const adminId = req.admin!.id;

  const config = await prisma.config.upsert({
    where: { key: validatedData.key },
    update: {
      value: validatedData.value,
      description: validatedData.description,
      updatedBy: adminId,
    },
    create: {
      key: validatedData.key,
      value: validatedData.value,
      description: validatedData.description,
      updatedBy: adminId,
    },
  });

  return APIResponse.success(res, "Config updated successfully", config);
};


//Initialize default configs (run once)

export const initializeDefaultConfigs = async (req: Request, res: Response, next: NextFunction) => {
  const defaultConfigs = [
    {
      key: "service_fee_pickup",
      value: "200",
      description: "Service fee charged per book for pickup orders",
    },
    {
      key: "service_fee_delivery",
      value: "400",
      description: "Service fee charged per book for delivery orders",
    },
    {
      key: "admin_app_url",
      value: "https://admin.booka.app",
      description: "URL for the admin dashboard/app",
    },
    {
      key: "agent_app_url",
      value: "https://test.app.com",
      description: "URL for downloading the Booka agent mobile app",
    },
    {
      key: "commission_pickup_agent",
      value: "80",
      description: "Commission in naira per book for agent on pickup orders",
    },
    {
      key: "commission_pickup_manager",
      value: "30",
      description: "Commission in naira per book for manager on pickup orders",
    },
    {
      key: "commission_delivery_agent",
      value: "120",
      description: "Commission in naira per book for agent on delivery orders",
    },
    {
      key: "commission_delivery_manager",
      value: "30",
      description: "Commission in naira per book for manager on delivery orders",
    },
    {
      key: "rescheduling_fee",
      value: "100",
      description: "Fee in naira for rescheduling an order after time slot expires",
    },
    {
      key: "pickup_time_slots",
      value: JSON.stringify(["9:00 AM - 11:00 AM", "1:00 PM - 5:00 PM"]),
      description: "Available time slots for pickup orders (JSON array)",
    },
    {
      key: "delivery_time_slots",
      value: JSON.stringify([
        "8:00 AM - 9:00 AM",
        "9:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 1:00 PM",
        "1:00 PM - 2:00 PM",
        "2:00 PM - 3:00 PM",
        "3:00 PM - 4:00 PM",
        "4:00 PM - 5:00 PM",
        "5:00 PM - 6:00 PM"
      ]),
      description: "Available time slots for delivery orders (JSON array)",
    },
    {
      key: "daily_report_time",
      value: "23:00",
      description: "Time to generate daily reports (format: HH:mm, 24-hour)",
    },
    {
      key: "weekly_report_time",
      value: "23:00",
      description: "Time to generate weekly reports on Saturdays (format: HH:mm, 24-hour)",
    },
    {
      key: "monthly_report_time",
      value: "23:00",
      description: "Time to generate monthly reports on last day of month (format: HH:mm, 24-hour)",
    },
  ];

  const results = [];
  for (const configData of defaultConfigs) {
    const existing = await prisma.config.findUnique({
      where: { key: configData.key },
    });

    if (!existing) {
      const config = await prisma.config.create({
        data: {
          ...configData,
          updatedBy: req.admin!.id,
        },
      });
      results.push(config);
    }
  }

  return APIResponse.success(
    res,
    `Initialized ${results.length} default configs`,
    results
  );
};
