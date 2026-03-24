import { useTeacherController } from './useTeacherController';
import { TeacherPageView } from './TeacherPageView';

export function TeacherPage() {
  const controller = useTeacherController();
  return <TeacherPageView {...controller} />;
}
