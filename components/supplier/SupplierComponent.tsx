import Head from "next/head";
import dynamic from "next/dynamic";
import router from "next/router";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { iSupplier } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { Content, View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { DialogContainer, Dialog, useDialogContainer } from "@react-spectrum/dialog";
import { Cell, Column, Row, TableView, TableBody, TableHeader } from '@react-spectrum/table'
import { ActionButton, Button } from "@react-spectrum/button";
import { NextPage } from "next";
import { SearchField } from "@react-spectrum/searchfield";
import InfoIcon from '@spectrum-icons/workflow/Info'
import { Heading } from "@react-spectrum/text";

const SupplierForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const siteTitle = "Supplier";

const initSupplier: iSupplier = {
  id: 0,
  name: '',
  salesName: '',
  street: '',
  city: '',
  phone: '',
  cell: '',
  email: ''
};

type supplierColumnType = {
  name: string,
  uid: string  
}

const SupplierComponent: NextPage = () => {
  let [supplierId, setSupplierId] = useState<number>(0);
//  let [supplier, setSupplier] = useState<iSupplier>({} as iSupplier);
  let [txtSearch, setTxtSearch] = useState<string>("");
  let [message, setMessage] = useState<string>("");
  const [open, setOpen] = React.useState(false);

  let columns: supplierColumnType[] = [
    { name: 'ID#', uid: 'id' },
    { name: 'Name', uid: 'name' },
    { name: 'Sales', uid: 'sales' },
    { name: 'Alamat', uid: 'street' },
    { name: 'Telp./Cell', uid: 'phone' },
    { name: 'Email', uid: 'mail' }
  ];

  let suppliers = useAsyncList<iSupplier>({
    async load({ signal }) {
      let res = await fetch("/api/supplier", { signal });
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
      setMessage(data)
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
      console.log(json.message)
      setMessage('Data supplier tidak dapat diupdate, mungkin nama supplier sama.')
    }
  }

  const closeForm = () => {
    setOpen(false)
  };

  return (
    <Layout activeMenu={"Supplier"}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <DialogContainer
        type={'modal'}
        onDismiss={() => setOpen(false)}
        isDismissable>
        {open && (
          <Dialog size="M">
            <Heading marginX="-1rem" marginY="-1rem">
              Supplier
              {/* supplier.id === 0 ? "Supplier Baru" : supplier.name */}
            </Heading>
            <Divider marginX="-1rem" width="calc(100% + 2rem)" />
            <Content margin="-1rem">
              <SupplierForm
                data={supplierId === 0 ? initSupplier : suppliers.getItem(supplierId)}
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
      <Flex justifyContent={"center"} marginY={"size-250"} columnGap={"size-125"}>
        <Button variant={"cta"}
        onPress={() => {
          setSupplierId(0);
          setOpen(true);
        }}
        >Supplier Baru</Button>
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
      <Divider size="S" />
      <TableView
        flex
        density="compact"
        aria-label="Supplier data list"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <Column key={column.uid} align={column.uid === 'id' ? 'end' : 'start'}>
              {column.name}
            </Column>
          )}
        </TableHeader>
        <TableBody
          items={suppliers.items}
          loadingState={suppliers.loadingState}
        >
          {(sup) => <Row key={sup.id}>
            <Cell>{sup.id}</Cell>
            <Cell>
              <ActionButton flex justifySelf={"flex-start"} isQuiet width={"auto"} height={"auto"}
                onPress={() => {
                  setSupplierId(sup.id);
                  setOpen(true);
                }}>
                <span>{sup.id === 0 ? 'Supplier Baru' : sup.name}</span>
              </ActionButton>
            </Cell>
            <Cell>{sup.salesName}</Cell>
            <Cell>{sup.street} - {sup.city}</Cell>
            <Cell>{sup.phone} / {sup.cell}</Cell>
            <Cell>{sup.email}</Cell>
          </Row>}
        </TableBody>
      </TableView>

      <div style={{ marginBottom: '24px' }} />
    </Layout>
  );
};

export default SupplierComponent;