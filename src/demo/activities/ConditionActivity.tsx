import { Button, Drawer } from 'antd';
import {
  ActivityFC,
  IActivity,
  ConditionActivity as TdConditionActivity,
  createResource,
} from 'approval-process-designer';
import React, { useState } from 'react';

export const ConditionActivity: ActivityFC<IActivity> = ({ ...props }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleSave = () => {
    props.processNode.props = { days: '3' };
  };

  return (
    <>
      <TdConditionActivity {...props} onClick={handleClick} />
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        footer={
          <>
            {' '}
            <Button onClick={handleSave}>确定</Button>
          </>
        }
      >
        condition drawer
      </Drawer>
    </>
  );
};
ConditionActivity.Resource = createResource({
  type: 'CONDITION',
  componentName: 'ConditionActivity',
});
