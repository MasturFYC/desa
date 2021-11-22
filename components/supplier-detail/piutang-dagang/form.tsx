import { NextPage } from "next";
import React, { FormEvent, Fragment, useState } from "react";
import { dateOnly, iSupplier, iStock, iProduct, dateParam, iStockPayment } from "@components/interfaces";
import { Content, View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextArea, TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { AsyncListData } from "@react-stately/data";
import { ComboBox, Item } from "@react-spectrum/combobox";
import dynamic from "next/dynamic";
import WaitMe from "@components/ui/wait-me";
import {
  DialogContainer,
  Dialog
} from "@react-spectrum/dialog";
import { Heading } from "@react-spectrum/text";
import { Divider } from "@react-spectrum/divider";

const StockDetail = dynamic(
  () => import("@components/stock/stock-detail"),
  {
    loading: () => <WaitMe />,
    ssr: false,
  }
);

const StockPaymentForm = dynamic(
  () => import("@components/supplier-detail/payment/form"),
  {
    loading: () => <WaitMe />,
    ssr: false,
  }
);

type StockFormProps = {
  data: iStock;
  products: AsyncListData<iProduct>;
  updateData: (method: string, data: iStock) => void;
  updateTotal: (stockId: number, subtotal: number, payments: number) => void;
  closeForm: () => void;
};

const StockForm: NextPage<StockFormProps> = ({
  data,
  products,
  updateData: updateStock,
  updateTotal,
  closeForm
}) => {
  let [stock, setStock] = React.useState<iStock>({} as iStock);
  let [message, setMessage] = useState<string>("");
  const [open, setOpen] = React.useState(false);

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
    updateTotal(stock.id, subtotal, stock.payments);
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

  const updatePayment = (method: string, data: iStockPayment) => {
    const test = {
      ...stock,
      payments: stock.payments + data.nominal,
      remainPayment: stock.total - (stock.payments + data.nominal + stock.cash)
    }

    setStock(x => (stock))

    updateTotal(stock.id, 0, test.payments)
  }

  const closePayment = () => {
    setOpen(false)
  }

  return (
    <Fragment>
      <DialogContainer
        type={"modal"}
        onDismiss={() => setOpen(false)}
        isDismissable
      >
        {open && (
          <Dialog size="L">
            <Heading>
              Angsuran
              {/* supplier.id === 0 ? "Supplier Baru" : supplier.name */}
            </Heading>
            <Divider size="S" />
            <Content>
              <StockPaymentForm
                data={{
                  id: 0,
                  stockId: stock.id,
                  payDate: dateParam(null),
                  nominal: stock.remainPayment,
                  payNum: '',
                  descriptions: 'Bayar Stock Pembelian #' + stock.stockNum,
                }}
                updatePayment={updatePayment}
                closeForm={closePayment}
              />
            </Content>
          </Dialog>
        )}
      </DialogContainer>
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
            isReadOnly
            hideStepper={true}
            width={"auto"}
            label={"Jumlah angsuran"}
            value={stock.payments}
            onChange={(e) =>
              setStock((o) => ({
                ...o,
                payments: e
              }))
            }
          />
          <View marginTop={"size-300"}>
            <Button variant={"primary"} isDisabled={stock.remainPayment <= 0} onPress={() => setOpen(true)}>Angsuran...</Button>
          </View>
          <NumberField
            flex
            isReadOnly
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
    </Fragment>

  );
};

export default StockForm;
