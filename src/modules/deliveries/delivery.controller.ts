import { Request, Response } from "express";
import { DeliveryService } from "./delivery.service";

const deliveryService = new DeliveryService();

export async function getAllDeliveries(req: Request, res: Response) {
  try {
    const deliveries = await deliveryService.getAllDeliveries();

    res.json(deliveries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
