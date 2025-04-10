import { css, Global } from '@emotion/react';
import { registerIcons } from 'approval-process-designer';
import React, { FC } from 'react';
import * as Icons from '../Icons';

type StudioPanelProps = {
  children?: React.ReactNode;
};

export const StudioPanel: FC<StudioPanelProps> = ({ children }) => {
  registerIcons(Icons);
  return (
    <div>
      <Global
        styles={css`
          ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }

          ::-webkit-scrollbar-thumb {
            background-color: #d9d9d9;
            border-radius: 0;
            transition: all 0.25s ease-in-out;
          }

          ::-webkit-scrollbar-thumb:hover {
            background-color: #f0f0f0;
          }

          .action-icon {
            display: inline-flex;
            align-items: center;
            padding: 4px;
          }
        `}
      />
      {children}
    </div>
  );
};
