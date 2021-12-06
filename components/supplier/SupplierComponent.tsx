import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { iSupplier } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { Content, View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import {
  DialogContainer,
  Dialog
} from "@react-spectrum/dialog";
import {
  Cell,
  Column,
  Row,
  TableView,
  TableBody,
  TableHeader,
} from "@react-spectrum/table";
import { ActionButton, Button } from "@react-spectrum/button";
import { NextPage } from "next";
import { SearchField } from "@react-spectrum/searchfield";
import InfoIcon from "@spectrum-icons/workflow/Info";
import { Heading } from "@react-spectrum/text";
import SpanLink from "@components/ui/span-link";

const SupplierForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const siteTitle = "Supplier";

const initSupplier: iSupplier = {
  id: 0,
  name: "",
  salesName: "",
  street: "",
  city: "",
  phone: "",
  cell: "",
  email: "",
};

type supplierColumnType = {
  name: string;
  uid: string;
  width: string;
};

const SupplierComponent: NextPage = () => {
  let [supplierId, setSupplierId] = useState<number>(0);
  //  let [supplier, setSupplier] = useState<iSupplier>({} as iSupplier);
  let [txtSearch, setTxtSearch] = useState<string>("");
  let [message, setMessage] = useState<string>("");
  const [open, setOpen] = React.useState(false);

  let columns: supplierColumnType[] = [
    { name: "ID#", uid: "id", width: "5%" },
    { name: "Name", uid: "name", width: "25%" },
    { name: "Sales", uid: "sales", width: "20%" },
    { name: "Alamat", uid: "street", width: "25%" },
    { name: "Telp./Cell", uid: "phone", width: "15%" },
    {name: "Detail", uid: "detail", width:"10%"}
  ];

  let suppliers = useAsyncList<iSupplier>({
    async load({ signal }) {
      let res = await fetch("/api/supplier", { signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        } });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iSupplier) => item.id,
  });

  const searchData = async () => {
    const txt = txtSearch.toLocaleLowerCase();
    const url = `/api/supplier/search/${txt}`;
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    await fetch(url, fetchOptions)
      .then(async (response) => {
        if (response.ok) {
          return response.json().then((data) => data);
        }
        return response.json().then((error) => {
          return Promise.reject(error);
        });
      })
      .then((data) => {
        suppliers.setSelectedKeys("all");
        suppliers.removeSelectedItems();
        suppliers.insert(0, ...data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteData = async (id: number) => {
    const url = `/api/supplier/${id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iSupplier | any = await res.json();

    if (res.status === 200) {
      //suppliers.selectedKeys= new Set(id.toString());
      suppliers.remove(id);
    } else {
      console.log("Pelanggan tidak dapat dihapus!");
      setMessage(data);
    }
  };

  const postData = (method: string, id: number, p: iSupplier) => {
    if (method === "DELETE") {
      deleteData(id);
    } else {
      updateData(method, id, p);
    }
  };

  async function updateData(method: string, id: number, p: iSupplier) {
    const url = `/api/supplier/${id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: p }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      if (method === "POST") {
        suppliers.insert(0, json);
      } else {
        suppliers.update(id, json);
      }
      closeForm();
    } else {
      console.log(json.message);
      setMessage(
        "Data supplier tidak dapat diupdate, mungkin nama supplier sama."
      );
    }
  }

  const closeForm = () => {
    setOpen(false);
  };

  return (
    <Layout activeMenu={"Supplier"}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <DialogContainer
        type={"modal"}
        onDismiss={() => setOpen(false)}
        isDismissable        
      >
        {open && (
          <Dialog size="L">
            <Heading>
              Supplier
              {/* supplier.id === 0 ? "Supplier Baru" : supplier.name */}
            </Heading>
            <Divider size="S" />
            <Content>
              <SupplierForm
                data={
                  supplierId === 0
                    ? initSupplier
                    : suppliers.getItem(supplierId)
                }
                updateData={postData}
              />
            </Content>
          </Dialog>
        )}
      </DialogContainer>

      <View marginBottom={"size-400"}>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>
          Data {siteTitle}
        </span>
      </View>
      <Flex marginY={"size-250"} columnGap={"size-125"}>
        <View flex>
          <Button
            width={"size-1600"}
            variant={"cta"}
            onPress={() => {
              setSupplierId(0);
              setOpen(true);
            }}
          >
            Supplier Baru
          </Button>
        </View>
        <SearchField
          alignSelf="center"
          justifySelf="center"
          aria-label="Search supplier"
          placeholder="e.g. cv. mandiri"
          width="auto"
          maxWidth="size-3600"
          value={txtSearch}
          onClear={() => suppliers.reload()}
          onChange={(e) => setTxtSearch(e)}
          onSubmit={() => searchData()}
        />
      </Flex>
      {suppliers &&
      <TableView density="compact" aria-label="Supplier data list">
        <TableHeader columns={columns}>
          {(column) => (
            <Column
              key={column.uid}
              align={column.uid === "id" ? "end" : "start"}
              width={column.width}
            >
              {column.name}
            </Column>
          )}
        </TableHeader>
        <TableBody
          items={suppliers.items}
          loadingState={suppliers.loadingState}
        >
          {(sup) => (
            <Row key={sup.id}>
              <Cell>{sup.id}</Cell>
              <Cell>
                <SpanLink
                  onClick={() => {
                    setSupplierId(sup.id);
                    setOpen(true);
                  }}
                >
                  {sup.id === 0 ? "Supplier Baru" : sup.name}
                </SpanLink>
              </Cell>
              <Cell>{sup.salesName}</Cell>
              <Cell>
                {sup.street} - {sup.city}
              </Cell>
              <Cell>
                {sup.phone} / {sup.cell}
              </Cell>
              <Cell>
                <Link href={'/supplier/[id]'} as={`/supplier/${sup.id}`} passHref>
                <a><InfoIcon size={"S"} /></a>
                </Link>
              </Cell>
            </Row>
          )}
        </TableBody>
      </TableView>}
    </Layout>
  );
};

export default SupplierComponent;
