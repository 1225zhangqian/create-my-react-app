import React from "react";
import '../style/index.scss'
import NotificationApi from "./notification.component";

const notificationInstance = {};
const typeToIcon = {
  warning: '../images/warning-icon.svg',
  success: '../images/success-icon.svg',
  info: '../images/info-icon.svg',
  error: '../images/error-icon.svg'
}
const typeToColor = {
  warning: '#faad14',
  success: '#52c41a',
  info: '#fff',
  error: '#f5222d'
}
let defaultDuration = 4.5;
let defaultTop = '24px';
let defaultBottom = '24px';
let defaultPlacement = 'bottomRight';
let defaultGetContainer = null;
function setNotificationConfig(options) {
  const { duration, bottom, placement, top, getContainer } = options;
  if (duration !== undefined) {
    defaultDuration = duration;
  }
  if (placement !== undefined) {
    defaultPlacement = placement;
  }
  if (bottom !== undefined) {
    defaultBottom = bottom;
  }
  if (top !== undefined) {
    defaultTop = top;
  }
  if (getContainer !== undefined) {
    defaultGetContainer = getContainer;
  }
}
const getPlacementStyle = (placement) => {
  let style;
  switch (placement) {
    case 'topLeft':
      style = {
        left: 0,
        top: defaultTop,
        bottom: 'auto',
      };
      break;
    case 'topRight':
      style = {
        right: 0,
        top: defaultTop,
        bottom: 'auto',
      };
      break;
    case 'bottomLeft':
      style = {
        left: 0,
        top: 'auto',
        bottom: defaultBottom,
      };
      break;
    default:
      style = {
        right: 0,
        top: 'auto',
        bottom: defaultBottom,
      };
      break;
  }
  return style;
}
const getNotificationInstance = (prefixCls, placement = defaultPlacement, callback) => {
  const cacheKey = `${prefixCls}-${placement}`;
  if (notificationInstance[cacheKey]) {
    callback(notificationInstance[cacheKey]);
    return;
  }
  NotificationApi.newInstance({
    prefixCls,
    className: placement ? `${prefixCls}-${placement}` : '',
    style: getPlacementStyle(placement),
    getContainer: defaultGetContainer,
    closeIcon: <img src='/images/close-icon.svg' alt='close' />,
  }, (notification) => {
    notificationInstance[cacheKey] = notification;
    callback(notification);
  });
}

const notice = (props) => {
  const outerPrefixCls = props.prefixCls || 'IS-notification';
  const prefixCls = `${outerPrefixCls}-notice`;
  const duration = props.duration === undefined ? defaultDuration : props.duration;
  // let iconNode = null;
  // if (props.icon) {
  //   iconNode = (
  //     <span className={`${prefixCls}-icon`}>
  //       {props.icon}
  //     </span>
  //   );
  // } else if (props.type) {
  //   const iconType = typeToIcon[props.type];
  //   iconNode = (
  //     <img
  //       className={`${prefixCls}-icon`}
  //       src={iconType} alt="icon"
  //     />
  //   );
  // }

  // let content = (
  //   <div className={iconNode ? `${prefixCls}-with-icon` : ''}>
  //     {iconNode}
  //     <div className={`${prefixCls}-message`}>
  //       {props.message}
  //     </div>
  //     <div className={`${prefixCls}-description`}>{props.description}</div>
  //     {props.btn ? <span className={`${prefixCls}-btn`}>{props.btn}</span> : null}
  //   </div>
  // )
  let style = { background: '#FFF' }
  if (props.type) {
    style = { background: typeToColor[props.type] }
    style = props.style ? Object.assign(style, props.style) : style
  }
  let message = props.message ? props.message : props.type ? props.type : ''
  let content = (
    <div className={`${prefixCls}-with-${props.type}`}>
      <div className={`${prefixCls}-message`}>
        {message}
      </div>
      <div className={`${prefixCls}-description`}>{props.description}</div>
      {props.btn ? <span className={`${prefixCls}-btn`}>{props.btn}</span> : null}
    </div>
  )
  getNotificationInstance(outerPrefixCls, props.placement, notification => {
    notification.notice({
      content: content,
      duration,
      closable: true,
      // onClose: props.onClose,
      key: props.key,
      style: style || {},
      className: props.className,
    });
  });
}
const Notification = {
  open: notice,
  close(key) {
    Object.keys(notificationInstance)
      .forEach(cacheKey => notificationInstance[cacheKey].removeNotice(key));
  },
  config: setNotificationConfig,
  destroy() {
    Object.keys(notificationInstance).forEach(cacheKey => {
      notificationInstance[cacheKey].destroy();
      delete notificationInstance[cacheKey];
    });
  },
};

['success', 'info', 'warning', 'error'].forEach((type) => {
  Notification[type] = (props) => Notification.open({
    ...props,
    type,
  });
});

export default Notification;
