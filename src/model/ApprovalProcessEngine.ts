import { define, observable } from '@formily/reactive';
import {
  getAddableActivityResources,
  transformToSchema,
} from 'approval-process-designer';
import _ from 'lodash';
import { IProcessNode, ProcessNode } from './ProcessNode';

interface IApprovalProcessEngine {
  value?: IProcessNode;
}

export class ApprovalProcessEngine {
  process: ProcessNode;
  onChange?: (value: any) => void;

  constructor(engine?: IApprovalProcessEngine) {
    this.process = new ProcessNode({
      conditionNodes: [],
      id: '',
      props: void 0,
      engine: this,
      type: 'START',
      componentName: 'StartActivity',
      title: '开始',
    });
    if (engine?.value) {
      this.process.from(engine.value);
    }
    this.makeObservable();
  }

  makeObservable() {
    define(this, {
      process: observable,
      addableActivityResources: observable.computed,
    });
  }

  handleChange = _.debounce(() => {
    this.onChange?.(transformToSchema(this.process));
  }, 0);

  setOnchange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  get addableActivityResources() {
    return getAddableActivityResources();
  }
}
