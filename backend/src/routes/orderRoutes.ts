import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  assignDriver,
  getAssignedOrders,
  updateDeliveryStatus,
} from "../controllers/orderController";
import { protect, authorise } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.post("/",authorise("customer"),createOrder);
router.get("/my-orders", authorise("customer"), getMyOrders);

router.get("/", authorise("admin"), getAllOrders);
router.put("/:id/status", authorise("admin"), updateOrderStatus);
router.put("/:id/assign-driver", authorise("admin"), assignDriver);

router.get("/assigned", authorise("driver"), getAssignedOrders);
router.put("/:id/delivery-status", authorise("driver"), updateDeliveryStatus);

router.get("/:id", getOrder);

export default router;