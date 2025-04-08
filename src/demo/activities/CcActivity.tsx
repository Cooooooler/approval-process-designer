import {
    ActivityFC,
    CcActivity as TdCcActivity,
    IActivity,createResource
} from "approval-process-designer";

export const CcActivity: ActivityFC<IActivity> = TdCcActivity

CcActivity.Resource = createResource({
    type: 'CC',
    icon: 'CcActivityIcon',
    componentName: 'CcActivity',
    title: '抄送人',
    addable: true
})
