import { define, observable } from '@formily/reactive';
import _ from 'lodash';
import { GlobalStore } from '../store';
import { DesignerCore } from '../util';
import { IProcessNode, ProcessNode } from './ProcessNode';

interface IApprovalProcessEngine {
  value?: IProcessNode;
}

export class ApprovalProcessEngine {
  process: ProcessNode;
  onChange?: (value: any) => void;

  constructor(engine?: IApprovalProcessEngine) {
    this.process = new ProcessNode({
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
    this.onChange?.(DesignerCore.transformToSchema(this.process));
  }, 0);

  setOnchange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  get addableActivityResources() {
    return GlobalStore.getAddableActivityResources();
  }
}
