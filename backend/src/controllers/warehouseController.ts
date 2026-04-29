import { Request, Response } from 'express';
import Warehouse from '../models/Warehouse';

// Create warehouse
export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, address } = req.body;
    const warehouse = await Warehouse.create({ name, location, address });
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all warehouses
export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
  try {
    const warehouses = await Warehouse.find();
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get single warehouse
export const getWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }
    res.status(200).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update warehouse
export const updateWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }
    res.status(200).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete warehouse
export const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }
    res.status(200).json({ message: 'Warehouse deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};