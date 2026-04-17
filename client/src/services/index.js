// src/services/index.js — DIPERBARUI
import api from "./api";
import {
  AUTH,
  VENDORS,
  PACKAGES,
  BOOKINGS,
  VENDOR_REQUESTS,
  ADMIN,
  GALLERY,
} from "../constants/apiRoutes";

const d = (r) => r.data?.data ?? r.data;

// Auth
export const authService = {
  login: (c) => api.post(AUTH.LOGIN, c).then(d),
  register: (d2) => api.post(AUTH.REGISTER, d2).then(d),
  verifyOtp: (d2) => api.post(AUTH.VERIFY_OTP, d2).then(d),
  resendOtp: (d2) => api.post(AUTH.RESEND_OTP, d2).then(d),
  me: () => api.get(AUTH.ME).then(d),
  logout: () => api.post(AUTH.LOGOUT).then(d),
  forgotPassword: (e) => api.post(AUTH.FORGOT_PASSWORD, { email: e }).then(d),
  resetPassword: (d2) => api.post(AUTH.RESET_PASSWORD, d2).then(d),
  updateProfile: (d2) => api.put(AUTH.UPDATE_PROFILE, d2).then(d),
  changePassword: (d2) => api.put(AUTH.CHANGE_PASSWORD, d2).then(d),
};

// Vendor
export const vendorService = {
  getAll: (p) => api.get(VENDORS.LIST, { params: p }).then(d),
  getBySlug: (s) => api.get(VENDORS.BY_SLUG(s)).then(d),
  getById: (id) => api.get(VENDORS.DETAIL(id)).then(d),
  getMy: () => api.get(VENDORS.MY).then(d),
  update: (id, data) => api.put(VENDORS.UPDATE(id), data).then(d),
};

// Packages (public)
export const packageService = {
  getAll: () => api.get(PACKAGES.LIST).then(d),
  getByTier: (t) => api.get(PACKAGES.BY_TIER(t)).then(d),
};

// Booking (customer)
export const bookingService = {
  getMy: () => api.get(BOOKINGS.MY).then(d),
  getById: (id) => api.get(BOOKINGS.DETAIL(id)).then(d),

  // PERUBAHAN: create tidak perlu vendor_id lagi
  // Wajib kirim: package_id, pemesan_*, wedding_date, location, konsep
  create: (data) => api.post(BOOKINGS.CREATE, data).then(d),

  payDP: (id) => api.post(BOOKINGS.PAY_DP(id)).then(d),
  payFull: (id) => api.post(BOOKINGS.PAY_FULL(id)).then(d),
  rate: (id, data) => api.post(BOOKINGS.RATE(id), data).then(d),
};

// Vendor request (vendor merespons request dari admin)
export const vendorRequestService = {
  getInbox: () => api.get(BOOKINGS.VENDOR_INBOX).then(d),
  confirm: (id, data) => api.post(VENDOR_REQUESTS.CONFIRM(id), data).then(d),
  reject: (id, data) => api.post(VENDOR_REQUESTS.REJECT(id), data).then(d),
};

// Admin
export const adminService = {
  getStats: () => api.get(ADMIN.STATS).then(d),
  getUsers: (p) => api.get(ADMIN.USERS, { params: p }).then(d),
  deleteUser: (id) => api.delete(ADMIN.USER_DELETE(id)).then(d),
  getVendors: (p) => api.get(ADMIN.VENDORS, { params: p }).then(d),
  approveVendor: (id) => api.patch(ADMIN.VENDOR_APPROVE(id)).then(d),
  rejectVendor: (id) => api.patch(ADMIN.VENDOR_REJECT(id)).then(d),
  getBookings: (p) => api.get(ADMIN.BOOKINGS, { params: p }).then(d),

  // Workflow WO — semua method baru
  assignVendor: (bookingId, data) =>
    api.patch(ADMIN.ASSIGN_VENDOR(bookingId), data).then(d),
  reassignVendor: (bookingId, data) =>
    api.patch(ADMIN.REASSIGN_VENDOR(bookingId), data).then(d),
  setTechMeeting: (bookingId, data) =>
    api.post(ADMIN.TECH_MEETING(bookingId), data).then(d),
  confirmTech: (bookingId) => api.patch(ADMIN.CONFIRM_TECH(bookingId)).then(d),
  updatePreparation: (bookingId, pct) =>
    api
      .patch(ADMIN.PREPARATION(bookingId), { preparation_progress: pct })
      .then(d),
  executeEvent: (bookingId) =>
    api.patch(ADMIN.EXECUTE_EVENT(bookingId)).then(d),
};

// Gallery
export const galleryService = {
  getAll: () => api.get(GALLERY.LIST).then(d),
  upload: (f) => {
    const form = new FormData();
    form.append("image", f);
    return api
      .post(GALLERY.UPLOAD, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(d);
  },
  delete: (id) => api.delete(GALLERY.DELETE(id)).then(d),
};
