import React, {FC, useEffect, useMemo, useState} from "react"
import {ApprovalProcessContext} from "../context";
import {ApprovalProcessEngine} from "../model/ApprovalProcessEngine";
import {IProcessNode} from "../model";
import _ from "lodash";

type ApprovalProcessDesignerProps = {
  children?: React.ReactNode;
  engine?: ApprovalProcessEngine
  value?: IProcessNode
  onChange?: (value: any) => void
}

export const ApprovalProcessDesigner: FC<ApprovalProcessDesignerProps> = ({children, engine, value, onChange}) => {
  const [scopeValue, setScopeValue] = useState(value)

  const designerEngine = useMemo(() => {
    if (engine) {
      return engine;
    } else {
      return new ApprovalProcessEngine({value})
    }
  }, [engine])

  useEffect(() => {
    designerEngine.setOnchange((value: any) => {
      if (!_.isEqual(scopeValue, value)) {
        setScopeValue(value)
        onChange?.(value)
      }
    })
    if (value && !_.isEqual(value, scopeValue)) {
      designerEngine.process.from(value)
    }
  }, [value])

  return <ApprovalProcessContext.Provider value={designerEngine}>
    {children}
  </ApprovalProcessContext.Provider>
}
