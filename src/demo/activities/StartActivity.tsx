import {
  ActivityFC,
  IActivity,
  StartActivity as TdStartActivity,
  createResource,
} from 'approval-process-designer';

export const StartActivity: ActivityFC<IActivity> = TdStartActivity;
StartActivity.Resource = createResource({
  type: 'START',
  componentName: 'StartActivity',
  title: '发起人',
});
