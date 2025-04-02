import {
    ActivityFC,
    DesignerCore,
    IActivity,
    StartActivity as TdStartActivity
} from "approval-process-designer";
import createResource = DesignerCore.createResource;

export const StartActivity: ActivityFC<IActivity> = TdStartActivity
StartActivity.Resource = createResource({
    type: 'START',
    componentName: 'StartActivity',
    title: '发起人'
})
