import { Component, signal } from '@angular/core';

type ModalState = 'loading' | 'success' | 'error' | null;

@Component({
  selector: 'app-status-modal',
  imports: [],
  templateUrl: './status-modal.html',
  styleUrl: './status-modal.css',
})
export class StatusModal {
  state = signal<ModalState>(null);
  title = signal('');
  message = signal('');
  callBackFunction!: Function | null;

  showLoading(message = 'Please wait. This might take sometime.') {
    this.state.set('loading');
    this.title.set('Loading...');
    this.message.set(message);
  }
  showSuccess({ message = 'Success', fn = () => {} }) {
    this.state.set('success');
    this.title.set('Success');
    this.message.set(message);
    if (typeof fn === 'function') {
      this.callBackFunction = fn;
    }
  }

  showError({ message = 'Something went wrong.', fn = () => {} }) {
    this.state.set('error');
    this.title.set('Error');
    this.message.set(message);
    if (typeof fn === 'function') {
      this.callBackFunction = fn;
    }
  }

  close() {
    this.state.set(null);
    if (typeof this.callBackFunction === 'function') {
      this.callBackFunction();
    }
  }

  retry() {
    this.showLoading();
    // emit retry event or call service
  }
}
