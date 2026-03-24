import { useTeacherController } from './useTeacherController';
import { TeacherPageView } from './TeacherPageView';

export function TeacherPage() {
  const ctrl = useTeacherController();
  return <TeacherPageView {...ctrl} />;
}
