import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iSupplier, iStock, iProduct } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextArea, TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { AsyncListData } from "@react-stately/data";
import { ComboBox, Item } from "@react-spectrum/combobox";
import supplier from "@components/supplier";
import dynamic from "next/dynamic";
import WaitMe from "@components/ui/wait-me";
import product from "@components/product";
import { text } from "pdfkit";

const StockDetail = dynamic(
  () => import("./stock-detail"),
  {
    loading: () => <WaitMe />,
    ssr: false,
  }
);

type StockFormProps = {
  data: iStock;
  products: AsyncListData<iProduct>;
  suppliers: AsyncListData<iSupplier>;
  updateData: (method: string, data: iStock) => void;
  updateTotal: (stockId: number, subtotal: number) => void;
  closeForm: () => void;
};

const StockForm: NextPage<StockFormProps> = ({
  data,
  products,
  suppliers,
  updateData: updateStock,
  updateTotal: updateTotal,
  closeForm
}) => {
  let [stock, setStock] = React.useState<iStock>({} as iStock);
  let [message, setMessage] = useState<string>("");

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setStock(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postStock(method: string) {
    const url = `/api/stock/${stock.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: stock }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateStock(stock.id === 0 ? "POST" : "PUT", {
        ...json,
        supplierName: stock.supplierName
      });
      closeForm();
    } else {
      console.log(json.message);
      setMessage("Data stock tidak bisa dipost, lihat log.");
    }
  }

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  }

  const handleSubmit = () => {
    postStock(stock.id === 0 ? "POST" : "PUT");
  };

  const reUpdateStock = (stockId: number, subtotal: number) => {
    updateTotal(stock.id, subtotal);
  }

  const deleteStock = async () => {
    const url = `/api/stock/${stock.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iStock | any = await res.json();

    if (res.status === 200) {
      updateStock("DELETE", stock);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "Stock tidak dapat dihapus, ada pembayaran piutang terkait stock ini."
      );
    }
  };

  return (
    <Form onSubmit={submitForm} isEmphasized marginY={"size-100"}>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
          autoFocus
          width={"auto"}
          flex
          //width={{ base: "auto", M: "67%" }}
          isRequired
          placeholder={"e.g. x-0001"}
          label={"No. Faktur"}
          value={stock.stockNum}
          onChange={(e) => setStock((o) => ({ ...o, stockNum: e }))}
        />
        <ComboBox
          width={{ base: "auto", M: "30%" }}
          label={"Supplier"}
          isRequired
          placeholder={"e.g. pilih supplier"}
          defaultItems={suppliers.items}
          selectedKey={stock.supplierId}
          onSelectionChange={(e) => setStock((o) => ({
            ...o,
            supplierId: +e,
            supplierName: suppliers.getItem(+e).name
          }))}
        >
          {(item) => <Item>{item.name}</Item>}
        </ComboBox>
        <TextField
          type={"date"}
          width={{ base: "auto", M: "25%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal stock"}
          value={dateOnly(stock.stockDate)}
          onChange={(e) => setStock((o) => ({ ...o, stockDate: e }))}
        />
      </Flex>

      <View backgroundColor={"gray-50"}>
        {stock.id > 0 &&
          <StockDetail products={products} stockId={stock.id} updateTotal={reUpdateStock} />
        }
      </View>

      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <NumberField
          flex
          isReadOnly
          isDisabled
          hideStepper={true}
          width={"auto"}
          label={"Total"}
          onChange={(e) => setStock((o) => ({ ...o, total: e }))}
          value={stock.total}
        />
        <NumberField
          flex
          isRequired
          hideStepper={true}
          width={"auto"}
          label={"Bayar"}
          onChange={(e) => setStock((o) => ({
            ...o,
            cash: e,
            remainPayment: o.total - o.payments - e
          }))}
          value={stock.cash}
        />
      </Flex>

      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <NumberField
          flex
          isDisabled
          isReadOnly
          hideStepper={true}
          width={"auto"}
          label={"Angsuran"}
          value={stock.payments}
          onChange={(e) =>
            setStock((o) => ({
              ...o,
              payments: e
            }))
          }
        />
        <NumberField
          flex
          isReadOnly
          isDisabled
          hideStepper={true}
          width={"auto"}
          label={"Piutang"}
          onChange={(e) => setStock((o) => ({ ...o, remainPayment: e }))}
          value={stock.remainPayment}
        />
      </Flex>
      <TextArea
        width={"auto"}
        flex
        placeholder={"e.g. Stock ini jatuh tempo pada tanggal ..."}
        label={"Keterangan"}
        value={stock.descriptions || ''}
        onChange={(e) => setStock((o) => ({ ...o, descriptions: e }))}
      />

      <Flex
        direction="row"
        gap="size-100"
        marginBottom={"size-100"}
        marginTop={"size-200"}
      >
        <View flex>
          <Button variant={"cta"} type={"button"} onPress={() => handleSubmit()}>
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => {
              if (stock.id === 0) {
                updateStock("DELETE", stock);
              }
              closeForm()
            }}
          >
            Close
          </Button>
        </View>
        {stock.id > 0 && (
          <View>
            <Button
              type={"button"}
              variant="negative"
              onPress={() => deleteStock()}
            >
              Delete
            </Button>
          </View>
        )}
      </Flex>
    </Form>
  );
};

export default StockForm;
