import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Select, Typography, type SelectProps } from "antd";
import React, { useState } from "react";

export interface SelectCustomOptionProps extends SelectProps {
  searchQuery: string;
  onClickDropdownAdd: () => void;
}

const SelectCustomOption: React.FC<SelectCustomOptionProps> = (props) => {
  const { onClickDropdownAdd, searchQuery, ...selectDefaultProps } = props;

  const [isVisible, setIsVisible] = useState(false);

  return (
    <Select
      open={isVisible}
      onDropdownVisibleChange={setIsVisible}
      showSearch
      placeholder="Masukkan/Pilih nama koordinator daerah"
      dropdownRender={(menu) => (
        <>
          {menu}
          {searchQuery.length > 0 ? (
            <>
              <Divider className="m-0 p-0" />
              <div className="m-0 flex flex-row content-between items-center pl-2">
                <Typography.Text className="flex flex-1">
                  {searchQuery}
                </Typography.Text>
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsVisible(false);
                    onClickDropdownAdd();
                  }}
                  onBlur={() => console.log("blurred")}
                  loading={props.loading}
                >
                  Tambahkan
                </Button>
              </div>
            </>
          ) : null}
        </>
      )}
      {...selectDefaultProps}
    />
  );
};

export default SelectCustomOption;
