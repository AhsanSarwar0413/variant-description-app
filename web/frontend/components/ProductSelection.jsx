import React, { useState } from 'react';
import {
    ResourceList,
    Divider,
    Collapsible,
    HorizontalStack,
    ResourceItem,
    Text,
    Layout,
    VerticalStack,
    AlphaCard,
    Button,
    Thumbnail,
    Modal,
    List,
    Icon
} from '@shopify/polaris';
import { ResourcePicker, Provider } from '@shopify/app-bridge-react';
import { AppBridgeProvider } from './providers';
import DescriptionEditor from './DescriptionEditor';
import { VaraintDescriptionDB } from '../../mongodbConfiguration';

import '../styles/ProductSelectionOverride.css';

function ProductSelection() {
    const [shopProducts, setShopProducts] = useState([]);
    const [openResourcePicker, setOpenResourcePicker] = useState(false);
    const [showDescription, setShowDescription] = useState(null);
    const [soldOutVariants, setSoldOutVariants] = useState([]);
    const [soldOutInfo, setSoldOutInfo] = useState(false);
    const [alreadySelected, setAlreadySelected] = useState([]);

    const handleSelection = (resources) => {
        const productSelection = [];
        setSoldOutVariants([]);
        let soldOutPorductFlag = 0;
        const soldOutVariantsName = [];
        let ProductFromResources = resources.selection.map(product => {
            productSelection.push({ id: product.id, variants: [] });
            return product.variants.map(variant => {
                productSelection[productSelection.length - 1].variants.push({ id: variant.id });
                console.log("Variant Inventory Quantity: ", variant.displayName, variant.inventoryQuantity);
                if (variant.inventoryQuantity < 1) {
                    soldOutPorductFlag = 1;
                    soldOutVariantsName.push({
                        id: variant.id,
                        variantName: variant.displayName,
                    });
                }
                return variant;
            });
        });
        setAlreadySelected(productSelection);
        //Flatten Variants Array
        ProductFromResources = ProductFromResources.reduce((acc, val) => acc.concat(val), []);
        setOpenResourcePicker(false);
        if (soldOutPorductFlag === 0) {
            setShopProducts(ProductFromResources);
        } else {
            setSoldOutInfo(true);
            setSoldOutVariants(soldOutVariantsName);
        }
    }

    const handleCollapse = (id) => {
        if (showDescription === id) {
            setShowDescription(null);
        }
        else {
            setShowDescription(id);
        }
    }

    const handleVariantPicker = () => {
        setOpenResourcePicker(true);
    }

    const deleteItem = (id) => {
        setShopProducts((shopProducts) => shopProducts.filter((item) => item.id !== id));
    }

    const saveDescription = async (id) => {
        const variantDescription = { id };
    }

    //Product Selection Logic
    const ProductSelectionSection = shopProducts.length === 0 ? (
        <>
            <Layout.Section>
                <AlphaCard>
                    <HorizontalStack align='space-between' blockAlign='center'>
                        <Text>Please select a variant for the description. </Text>
                        <Button primary onClick={() => setOpenResourcePicker(true)}>Add Variant</Button>
                    </HorizontalStack>
                </AlphaCard>
            </Layout.Section>
        </>
    )
        : (
            <Layout.Section>
                <VerticalStack as="div" inlineAlign="end">
                    <Button primary onClick={() => handleVariantPicker()}>Add Variant</Button>
                </VerticalStack>
                <Layout.Section>
                    <AlphaCard>
                        <VerticalStack>
                            <ResourceList
                                resourceName={{ singular: 'Product', plural: 'Products' }}
                                items={shopProducts}
                                renderItem={(item) => {
                                    const { id, title, image } = item;
                                    let variantImage = '';
                                    let productID = id.split('/');
                                    productID = parseInt(productID[productID.length - 1]);
                                    if (image?.originalSrc) {
                                        variantImage = <Thumbnail source={image.originalSrc} alt={title} size="large" />;
                                    }
                                    else {
                                        variantImage = <Thumbnail source="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg" alt={title} size="large" />;
                                    }
                                    return (
                                        <>
                                            <ResourceItem
                                                id={productID}
                                                media={variantImage}
                                                accessibilityLabel={`View details for ${title}`}
                                                key={productID}
                                            >
                                                <HorizontalStack blockAlign="center" wrap={false} align="space-between">
                                                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                        {title}
                                                    </Text>
                                                    <HorizontalStack gap="4">
                                                        <Button
                                                            onClick={() => handleCollapse(productID)}
                                                            primary={showDescription !== productID}
                                                        >
                                                            Show Description
                                                        </Button>
                                                        <Button
                                                            destructive
                                                            size="medium"
                                                            onClick={() => deleteItem(id)}
                                                        >
                                                            <svg viewBox="0 0 20 20" height="16" width="16" class="Polaris-Icon__Svg" focusable="false" ariaHidden="true"><path fillRule="evenodd" d="M14 4h3a1 1 0 0 1 1 1v1h-16v-1a1 1 0 0 1 1-1h3v-2.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5v2.5zm-6-2v2h4v-2h-4zm-5 6h14v10.5a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5v-10.5zm4 3h-2v6h2v-6zm4 0h-2v6h2v-6zm2 0h2v6h-2v-6z"></path></svg>
                                                        </Button>
                                                    </HorizontalStack>
                                                </HorizontalStack>
                                            </ResourceItem>
                                            <Layout>
                                                <Layout.Section>
                                                    <Collapsible
                                                        open={showDescription === productID}
                                                        id="basic-collapsible"
                                                        transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                                        expandOnPrint
                                                    >
                                                        <AlphaCard>
                                                            <VerticalStack gap="10">
                                                                <DescriptionEditor />
                                                                <VerticalStack inlineAlign="end">
                                                                    <Button primary onClick={() => saveDescription(id)}>Save Description</Button>
                                                                </VerticalStack>
                                                            </VerticalStack>
                                                        </AlphaCard>
                                                    </Collapsible>
                                                </Layout.Section>
                                            </Layout>
                                            <Divider />
                                        </>
                                    );
                                }} />
                        </VerticalStack>
                    </AlphaCard>
                </Layout.Section>

            </Layout.Section>
        );

    return (
        <>
            <AppBridgeProvider>
                <ResourcePicker
                    resourceType="Product"
                    showVariants={true}
                    open={openResourcePicker}
                    onCancel={() => setOpenResourcePicker(false)}
                    onSelection={(resources) => handleSelection(resources)}
                    initialSelectionIds={alreadySelected}
                />
            </AppBridgeProvider>
            {ProductSelectionSection}
            <div>
                <Modal
                    open={soldOutInfo}
                    onClose={() => setSoldOutInfo(false)}
                    title="Error"
                    small
                >
                    <Modal.Section>
                        <VerticalStack gap="4">
                            <Text as="p">Following variants are sold out. Please select a variant with inventory.</Text>
                            <List type="bullet">
                                {soldOutVariants.map(variant => <List.Item key={variant.id}>{variant.variantName}</List.Item>)}
                            </List>
                        </VerticalStack>
                    </Modal.Section>
                </Modal>
            </div>
        </>
    )
}

export default ProductSelection;