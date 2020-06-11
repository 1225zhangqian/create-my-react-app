import React, { Component } from 'react';
import Animate from './animate.component'
export default class Notice extends Component {
  state = { fadein: true }
  componentDidMount() {
    this.startCloseTimer();
  }

  componentDidUpdate(prevProps) {
    if (this.props.duration !== prevProps.duration
      || this.props.update) {
      this.restartCloseTimer();
    }
  }

  componentWillUnmount() {
    this.clearCloseTimer();
  }
  closeHander = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState(state => ({ fadein: !state.fadein }));
  }
  close = () => {
    this.clearCloseTimer();
    this.props.onClose();
  }

  startCloseTimer = () => {
    if (this.props.duration) {
      this.closeTimer = setTimeout(() => {
        this.closeHander();
      }, this.props.duration * 1000);
    }
  }

  clearCloseTimer = () => {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  restartCloseTimer() {
    this.clearCloseTimer();
    this.startCloseTimer();
  }

  render() {
    const props = this.props;
    const componentClass = `${props.prefixCls}-notice`;
    return (
      <Animate
        fadein={this.state.fadein}
        onExited={this.close}
        className={`${componentClass}`}
      >
        <div
          className={`${componentClass} `}
          style={props.style}
          onMouseEnter={this.clearCloseTimer}
          onMouseLeave={this.startCloseTimer}
          onClick={this.closeHander}
        >
          <div className={`${componentClass}-content`}>{props.children}</div>
          {/* <span tabIndex="0" onClick={this.closeHander} className={`${componentClass}-close`}>
            {props.closeIcon}
          </span> */}
        </div>
      </Animate >
    );
  }
}