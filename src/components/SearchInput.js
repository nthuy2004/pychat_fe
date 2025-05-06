import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { OutlinedInput } from '@mui/material';

const SearchInput = ({
    value,
    onChange,
    placeholder = 'Search...',
    fullWidth = true,
    size = 'medium',
    variant = 'outlined',
    disabled = false,
    ...props
}) => {
    return (
        <OutlinedInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            fullWidth={fullWidth}
            size={size}
            variant={variant}
            disabled={disabled}
            sx={{ flexGrow: 1 }}
            startAdornment={
                <InputAdornment position="start">
                    <MagnifyingGlass />
                </InputAdornment>
            }
            {...props}
        />
    );
};

SearchInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    fullWidth: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium']),
    variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
    disabled: PropTypes.bool,
};

export default SearchInput;