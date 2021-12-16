import React, { useState } from "react";
import { dateOnly } from "@components/interfaces";
import { TextField } from "@react-spectrum/textfield";
import { ComboBox, Item } from "@react-spectrum/combobox";


export type FormFilterType = {
  startDate: string,
  endDate: string,
  saleType: number
}

type FilterFormProps = {
  setFilter: React.Dispatch<React.SetStateAction<FormFilterType>>;
  filter: FormFilterType;
}

export function FilterForm(props: FilterFormProps) {
  let { setFilter, filter } = props;

  let saleTypes = [
    { id: 0, name: 'All' },
    { id: 1, name: 'Toko' },
    { id: 2, name: 'Pertanian' }
  ];


  return <>
    <TextField
      type={"date"}
      width={{ base: "auto", M: "size-3000" }}
      placeholder={"e.g. dd/mm/yyyy"}
      labelPosition={"side"}
      label={"Dari tanggal:"}
      value={dateOnly(filter.startDate)}
      onChange={(e) => setFilter(o => ({ ...o, startDate: e }))} />
    <TextField
      type={"date"}
      width={{ base: "auto", M: "size-3000" }}
      placeholder={"e.g. dd/mm/yyyy"}
      labelPosition={"side"}
      label={"Sampai tanggal:"}
      value={dateOnly(filter.endDate)}
      onChange={(e) => setFilter(o=>({ ...o, endDate: e }))} />
    <ComboBox
      width={{ base: "auto", M: "size-2000" }}
      aria-label={'Tipe-penjualan'}
      items={saleTypes} selectedKey={filter.saleType} onSelectionChange={(e) => setFilter(o => ({ ...o, saleType: +e }))}>
      {(item) => <Item>{item.name}</Item>}
    </ComboBox>
  </>;
}
