import React from 'react'
import PropTypes from 'prop-types';
import { Button } from 'antd'

export default function AntdButton({ label, ...props }) {
  return (
    <Button {...props}>
      {label}
    </Button>
  )
}

AntdButton.propTypes = {
  /**
   * Is this the principal call to action on the page?
   */
  type: PropTypes.oneOf(['primary', 'ghost', 'dashed', 'link', 'text', 'default']),
  /**
   * How large should the button be?
   */
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  /**
   * Button contents
   */
  label: PropTypes.string.isRequired,
};

AntdButton.defaultProps = {
  type: 'default',
  size: 'middle',
};
