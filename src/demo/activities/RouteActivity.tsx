import {
  ActivityFC,
  IActivity,
  RouteActivity as TdRouteActivity,
  createResource,
} from 'approval-process-designer';

export const RouteActivity: ActivityFC<IActivity> = TdRouteActivity;

RouteActivity.Resource = createResource({
  icon: 'RouteActivityIcon',
  type: 'ROUTE',
  componentName: 'RouteActivity',
  title: '条件分支',
  addable: true,
});
