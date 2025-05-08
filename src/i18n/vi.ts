// src/i18n/vi.ts

// Define or import the Translation type
type Translation = {
  general: Record<string, string>
  fields: Record<string, string>
  auth: Record<string, string>
  // Add other groups as needed
}

const vi: Translation = {
  general: {
    save: 'Lưu',
    add: 'Thêm',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    // ... thêm các key khác tại đây
  },
  fields: {
    id: 'ID',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
    // ...
  },
  auth: {
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    email: 'Email',
    password: 'Mật khẩu',
    forgotPassword: 'Quên mật khẩu',
    // ...
  },
  // Có thể thêm nhiều nhóm key: dashboard, nav, upload, etc.
}

export default vi
