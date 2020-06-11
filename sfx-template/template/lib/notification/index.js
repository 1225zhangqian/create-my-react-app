"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

require("../style/index.scss");

var _notification = require("./notification.component");

var _notification2 = _interopRequireDefault(_notification);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var notificationInstance = {};
var typeToIcon = {
  warning: '../images/warning-icon.svg',
  success: '../images/success-icon.svg',
  info: '../images/info-icon.svg',
  error: '../images/error-icon.svg'
};
var typeToColor = {
  warning: '#faad14',
  success: '#52c41a',
  info: '#fff',
  error: '#f5222d'
};
var defaultDuration = 4.5;
var defaultTop = '24px';
var defaultBottom = '24px';
var defaultPlacement = 'bottomRight';
var defaultGetContainer = null;
function setNotificationConfig(options) {
  var duration = options.duration,
      bottom = options.bottom,
      placement = options.placement,
      top = options.top,
      getContainer = options.getContainer;

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
var getPlacementStyle = function getPlacementStyle(placement) {
  var style = void 0;
  switch (placement) {
    case 'topLeft':
      style = {
        left: 0,
        top: defaultTop,
        bottom: 'auto'
      };
      break;
    case 'topRight':
      style = {
        right: 0,
        top: defaultTop,
        bottom: 'auto'
      };
      break;
    case 'bottomLeft':
      style = {
        left: 0,
        top: 'auto',
        bottom: defaultBottom
      };
      break;
    default:
      style = {
        right: 0,
        top: 'auto',
        bottom: defaultBottom
      };
      break;
  }
  return style;
};
var getNotificationInstance = function getNotificationInstance(prefixCls) {
  var placement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultPlacement;
  var callback = arguments[2];

  var cacheKey = prefixCls + "-" + placement;
  if (notificationInstance[cacheKey]) {
    callback(notificationInstance[cacheKey]);
    return;
  }
  _notification2.default.newInstance({
    prefixCls: prefixCls,
    className: placement ? prefixCls + "-" + placement : '',
    style: getPlacementStyle(placement),
    getContainer: defaultGetContainer,
    closeIcon: _react2.default.createElement("img", { src: "/images/close-icon.svg", alt: "close" })
  }, function (notification) {
    notificationInstance[cacheKey] = notification;
    callback(notification);
  });
};

var notice = function notice(props) {
  var outerPrefixCls = props.prefixCls || 'IS-notification';
  var prefixCls = outerPrefixCls + "-notice";
  var duration = props.duration === undefined ? defaultDuration : props.duration;
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
  var style = { background: '#FFF' };
  if (props.type) {
    style = { background: typeToColor[props.type] };
    style = props.style ? Object.assign(style, props.style) : style;
  }
  var message = props.message ? props.message : props.type ? props.type : '';
  var content = _react2.default.createElement(
    "div",
    { className: prefixCls + "-with-" + props.type },
    _react2.default.createElement(
      "div",
      { className: prefixCls + "-message" },
      message
    ),
    _react2.default.createElement(
      "div",
      { className: prefixCls + "-description" },
      props.description
    ),
    props.btn ? _react2.default.createElement(
      "span",
      { className: prefixCls + "-btn" },
      props.btn
    ) : null
  );
  getNotificationInstance(outerPrefixCls, props.placement, function (notification) {
    notification.notice({
      content: content,
      duration: duration,
      closable: true,
      // onClose: props.onClose,
      key: props.key,
      style: style || {},
      className: props.className
    });
  });
};
var Notification = {
  open: notice,
  close: function close(key) {
    Object.keys(notificationInstance).forEach(function (cacheKey) {
      return notificationInstance[cacheKey].removeNotice(key);
    });
  },

  config: setNotificationConfig,
  destroy: function destroy() {
    Object.keys(notificationInstance).forEach(function (cacheKey) {
      notificationInstance[cacheKey].destroy();
      delete notificationInstance[cacheKey];
    });
  }
};

['success', 'info', 'warning', 'error'].forEach(function (type) {
  Notification[type] = function (props) {
    return Notification.open(_extends({}, props, {
      type: type
    }));
  };
});

exports.default = Notification;