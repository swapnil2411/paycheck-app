import React from 'react'
import Select from 'react-select'

const SelectDropdown = ({options, menuIsOpen, onChange, value}) => {
  return (
    <Select 
        options={options}
        className="react-select"
        classNamePrefix="react-select"
        placeholder="Select"
        menuIsOpen={menuIsOpen}
        onChange={onChange}
        value={value}
    />
  )
}

export default SelectDropdown