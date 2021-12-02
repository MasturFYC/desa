import Head from "next/head";
import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { iProduct, iCategory } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { Content, View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { NextPage } from "next";
import { SearchField } from "@react-spectrum/searchfield";
import { FormatNumber } from "@lib/format";
import Pin from '@spectrum-icons/workflow/PinOff'
import EditIcon from '@spectrum-icons/workflow/Edit'
import AddIcon from '@spectrum-icons/workflow/NewItem'
import { ActionButton, ToggleButton } from "@react-spectrum/button";
import { Text } from "@react-spectrum/text";
import { initProduct } from "./form";
import SpanLink from "@components/ui/span-link";
import { Picker, Item } from "@react-spectrum/picker";
import {
  DialogContainer,
  Dialog
} from "@react-spectrum/dialog";
import { Heading } from "@react-spectrum/text";

const UnitComponent = dynamic(() => import("@components/unit/UnitComponent"), {
  loading: () => <WaitMe />,
  ssr: false
})

const CategoryForm = dynamic(() => import("./category-form"), {
  loading: () => <WaitMe />,
  ssr: false
})

const ProductForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false
})

const siteTitle = "Produk";

const ProductComponent: NextPage = () => {
  let [selectedId, setSelectedId] = React.useState<number>(-1);
  let [editedCategoryId, setEditedCategoryId] = React.useState<number>(0);
  let [txtSearch, setTxtSearch] = React.useState<string>("");
  let [txt, setTxt] = React.useState<string>("");
  let [message, setMessage] = React.useState<string>("");
  let [categoryId, setCategoryId] = useState<number>(0);
  let [isOpen, setIsOpen] = useState<boolean>(false);

  let categories = useAsyncList<iCategory>({
    async load({ signal }) {
      let res = await fetch("/api/category", {
        signal,
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      let json = await res.json();
      return { items: [{ id: 0, name: 'All' }, ...json] };
    },
    getKey: (item: iCategory) => item.id,
  });


  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch("/api/product", {
        signal,
        method: "GET",
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

  // 87717777335

  // const searchProduct = async () => {

  //   const txt = txtSearch.toLocaleLowerCase();
  //   const url = `/api/product/search/${txt}`;
  //   const fetchOptions = {
  //     method: "GET",
  //     headers: {
  //       "Content-type": "application/json; charset=UTF-8",
  //     },
  //   };

  //   await fetch(url, fetchOptions)
  //     .then(async (response) => {
  //       if (response.ok) {
  //         return response.json().then((data) => data);
  //       }
  //       return response.json().then((error) => {
  //         return Promise.reject(error);
  //       });
  //     })
  //     .then((data) => {
  //       products.setSelectedKeys("all");
  //       products.removeSelectedItems();
  //       products.insert(0, initProduct, ...data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  const deleteData = async (id: number) => {
    const url = `/api/product/${id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iProduct | any = await res.json();

    if (res.status === 200) {
      products.remove(id);
    } else {
      console.log("Produk tidak dapat dihapus!");
      setMessage('Produk tidak dapat dihapus')
    }
  };

  const postProduct = (method: string, id: number, p: iProduct) => {
    if (method === "DELETE") {
      deleteData(id);
    } else {
      updateProduct(method, id, p);
    }
  };

  async function updateProduct(method: string, id: number, p: iProduct) {
    const url = `/api/product/${id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        data: {
          categoryId: p.categoryId,
          id: p.id,
          name: p.name,
          spec: p.spec,
          price: p.price,
          stock: p.stock,
          firstStock: p.firstStock,
          unit: p.unit
        }
      }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      if (method === "POST") {
        products.insert(1, json);
      } else {
        products.update(id, { ...json, units: p.units });
      }
      closeForm();
    } else {
      console.log(json.message)
      setMessage('Data produk tidak dapat diupdate, mungkin nama produk sama.')
    }
  }

  const closeForm = () => {
    setSelectedId(-1);
    setMessage('')
  };

  function getProductFiler() {
    if (txtSearch.length === 0) {
      return [initProduct, ...products.items.filter(x => x.categoryId === categoryId || categoryId === 0)];
    }
    return [initProduct, ...products.items.filter(x => x.name.toLocaleLowerCase().includes(txtSearch.toLocaleLowerCase()))]
  }


  return (
    <Layout activeMenu={siteTitle}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <View marginBottom={"size-400"}>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>
          Data {siteTitle}
        </span>
      </View>

      <DialogContainer
        type={"modal"}
        onDismiss={() => setIsOpen(false)}
        isDismissable
      >
        {isOpen && (
          <Dialog size="S">
            <Heading>
              Kategori
            </Heading>
            <Divider size="S" />
            <Content>
              <CategoryForm
                closeForm={setIsOpen}
                category={editedCategoryId === 0 ? { id: 0, name: '' } : categories.getItem(editedCategoryId)}
                updateCategory={updateCategory}
              />
            </Content>
          </Dialog>
        )}
      </DialogContainer>

      {categories.isLoading && <WaitMe />}

      <Flex marginY={"size-250"} flex>
        <Flex direction={"row"} flex gap={"size-50"}>
          <Picker
            aria-label="Product Categories"
            items={categories.items}
            selectedKey={categoryId}
            onSelectionChange={(e) => {
              setTxtSearch('');
              setCategoryId(+e);
            }}>
            {(item) => <Item>{item.name}</Item>}
          </Picker>
          <ActionButton
            isQuiet
            onPress={() => {
              setEditedCategoryId(categoryId);
              setIsOpen(true);
            }}>
            <EditIcon size={"XS"} />
          </ActionButton>
          <ActionButton
            isQuiet
            onPress={() => {
              setEditedCategoryId(0);
              setIsOpen(true);
            }}>
            <AddIcon size={"XS"} margin={0} />
          </ActionButton>
        </Flex>
        <SearchField
          aria-label="Search product"
          placeholder={`e.g. sp30`}
          width="auto"
          maxWidth="size-3600"
          value={txt}
          onClear={() => setTxtSearch('')}
          onChange={(e) => setTxt(e)}
          onSubmit={(e) => {
            setCategoryId(0);
            setTxtSearch(e);
          }} //searchProduct()}
        />
      </Flex>
      {products.isLoading && <WaitMe />}
      <Divider size="S" />
      {products && getProductFiler().map((x, i) => (
        <View key={x.id}>
          <View
            borderColor={selectedId === x.id ? "indigo-500" : "transparent"}
            paddingStart={selectedId === x.id ? "size-100" : 0}
            borderStartWidth={"thickest"}
            marginY={"size-50"}
          >
            <Flex
              direction={{ base: "column", M: "row" }}
              rowGap={"size-100"}
              columnGap="size-400"
            >
              <View width={{ base: "auto", M: "35%" }}>
                <SpanLink
                  onClick={() => {
                    setSelectedId(selectedId === x.id ? -1 : x.id);
                  }}
                >
                  {x.id === 0 ? 'Produk Baru' : `${x.name}${x.spec && ', ' + x.spec}`}
                </SpanLink>
              </View>
              {x.id > 0 && (
                <View flex>
                  ID#: <strong>{x.id}</strong>{", "}
                  Harga: <strong>{FormatNumber(x.price)}</strong>
                  <br />
                  Stock Awal: <strong>{FormatNumber(x.firstStock)} {x.unit}</strong>{", "}
                  Sisa Stock: <strong>{FormatNumber(x.stock)} {x.unit}</strong>
                  <br />
                  Kategori:{" "}
                  <SpanLink
                    onClick={() => {
                      setEditedCategoryId(x.categoryId);
                      setIsOpen(true);
                    }}>
                    <strong>{categories && categories.getItem(x.categoryId) && categories.getItem(x.categoryId).name}</strong>
                  </SpanLink>
                </View>
              )}
            </Flex>
            {x.id > 0 && selectedId !== x.id && <ToggleUnit data={x} />}
            {selectedId === x.id && (
              <Fragment>
                <View paddingX={{ base: 0, M: "size-1000" }}>
                  <ProductForm
                    data={x}
                    categories={categories.items.filter(o => o.id !== 0)}
                    updateProduct={postProduct}
                    closeForm={closeForm}
                  />
                  <View marginY={"size-100"}><span style={{ color: 'red' }}>{message}</span></View>
                </View>
              </Fragment>
            )}
          </View>
          <Divider size="S" />
        </View>
      ))}
      <div style={{ marginBottom: '24px' }} />
    </Layout>
  );

  function updateCategory(method: string, id: number, data: iCategory) {
    switch (method) {
      case 'DELETE': {
        deleteCategoryData(data.id);
      } break;
      case 'PUT': {
        updateCategoryData(id, data);
      } break;
      case 'POST': {
        insertCategoryData(data);
      } break;
    }
  }

  async function deleteCategoryData(id: number) {
    const url = `/api/category/${id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
    const res = await fetch(url, fetchOptions);
    const data = await res.json();

    if (res.status === 200) {
      setIsOpen(false);
      categories.remove(id);
      setCategoryId(0);
    } else {
      setMessage(
        "Kategori tidak dapat dihapus, ada produk terkait dgn kategori ini."
      );
    }
  }

  async function insertCategoryData(p: iCategory) {
    const url = "/api/category/0";

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: p }),
    }
    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      setIsOpen(false);
      categories.insert(0, json);
      setCategoryId(json.id);
    } else {
      setMessage(
        "Kategori tidak dapat diupdate, mungkin ada data nama yang sama."
      );
    }
  }

  async function updateCategoryData(id: number, p: iCategory) {
    const url = `/api/category/${id}`;
    const fetchOptions = {
      method: "PUT",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: p }),
    }
    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      setIsOpen(false);
      categories.update(id, json);
    } else {
      setMessage(
        "Kategori tidak dapat diupdate, mungkin ada data nama yang sama."
      );
    }
  }
};


type ToggleUnitProps = {
  data: iProduct
}

function ToggleUnit({
  data
}: ToggleUnitProps) {
  let [isShow, setIsShow] = useState<boolean>(false);
  return (
    <View flex marginTop={{ base: 18, M: -18 }}>
      <ToggleButton flex height={"auto"} isEmphasized isSelected={isShow} onChange={setIsShow} isQuiet marginBottom={"size-100"}>
        <Pin aria-label="Pin" size="S" />
        <Text>Unit</Text>
      </ToggleButton>

      {isShow && <UnitComponent productId={data.id} price={data.price} unit={data.unit} />}
    </View>
  )
}

export default ProductComponent;


