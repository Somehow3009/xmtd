import { useForm } from 'react-hook-form';
import { login } from '../api';
import { UserInfo } from '../api/types';
import { useState } from 'react';

type Props = {
  onLoggedIn: (payload: { user: UserInfo }) => void;
};

type LoginFields = {
  username: string;
  password: string;
};

export function LoginPanel({ onLoggedIn }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null);
      const res = await login(values.username, values.password);
      onLoggedIn({ user: res.user });
    } catch (e) {
      setError('Đăng nhập thất bại, kiểm tra lại thông tin.');
    }
  });

  return (
    <div className="card">
      <h3>Đăng nhập</h3>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label>Tên đăng nhập</label>
          <input
            className="input"
            {...register('username', { required: 'Bắt buộc' })}
            placeholder="dvkh1"
          />
          {errors.username && <small style={{ color: '#ffb4b4' }}>{errors.username.message}</small>}
        </div>
        <div className="form-row">
          <label>Mật khẩu</label>
          <input
            className="input"
            type="password"
            {...register('password', { required: 'Bắt buộc' })}
            placeholder="password123"
          />
          {errors.password && <small style={{ color: '#ffb4b4' }}>{errors.password.message}</small>}
        </div>
        {error && <div style={{ color: '#ff9b9b', marginBottom: 8 }}>{error}</div>}
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
