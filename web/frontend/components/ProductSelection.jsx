import React, { useState, useEffect } from 'react';
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
} from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from '../hooks';
import { AppBridgeProvider } from './providers';
import DescriptionEditor from './DescriptionEditor';

import '../styles/ProductSelectionOverride.css';

function ProductSelection() {
    const [shopProducts, setShopProducts] = useState([]);
    const [openResourcePicker, setOpenResourcePicker] = useState(false);
    const [showDescription, setShowDescription] = useState(null);
    const [soldOutVariants, setSoldOutVariants] = useState([]);
    const [soldOutInfo, setSoldOutInfo] = useState(false);
    const [alreadySelected, setAlreadySelected] = useState([]);
    const authFetch = useAuthenticatedFetch();

    const handleSelection = (resources) => {
        const productSelection = [];
        setSoldOutVariants([]);
        let soldOutPorductFlag = 0;
        const soldOutVariantsName = [];
        let ProductFromResources = resources.selection.map(product => {
            productSelection.push({ id: product.id, variants: [] });
            return product.variants.map(variant => {
                productSelection[productSelection.length - 1].variants.push({ id: variant.id });
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
            ProductFromResources = ProductFromResources.map(variant => variant);
            ProductFromResources = ProductFromResources.filter(variant => !shopProducts.find(item => item.id === variant.id));
            setShopProducts((shopProducts) => [...shopProducts, ...ProductFromResources]);
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

    const deleteItem = async (id) => {
        const response = await authFetch('/api/variant/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variantId: id,
            }),
        });
        if (response.ok) {
            setShopProducts((shopProducts) => shopProducts.filter((item) => item.id !== id));
        } else {
            console.error('Error deleting variant:', response);
        }
    };

    useEffect(() => {

        const createScriptTag = async () => {

            const response = await authFetch('/api/shop');
            const data = await response.json();
            const test = await authFetch(`/api/get/variantids?shop=${data.data[0].myshopify_domain}&host=${data.data[0].myshopify_domain}`);
            const testData = await test.json();
            console.log("test", testData);
            if (data) {
                const tagsResponse = await authFetch(`/api/create-script-tag`);
                const tagsData = await tagsResponse.json();
                console.log(tagsData);
            }
        }
        const fetchVariants = async () => {
            try {
                const response = await authFetch('/api/get/variants');
                const data = await response.json();
                if (data !== null) {
                    const result = {};
                    const resourcePickerSelection = [];
                    setShopProducts(data.map(variant => ({
                        ...variant.variantData,
                        variantDescription: variant.description,
                    })));
                    data.forEach(item => {
                        const productId = item.variantData.product.id;
                        if (!result[productId]) {
                            result[productId] = { id: productId, variants: [] };
                        }
                        result[productId].variants.push({ id: item.variantId });
                    });
                    resourcePickerSelection.push(...Object.values(result));
                    setAlreadySelected(resourcePickerSelection);
                }
            } catch (error) {
                console.error('Error fetching variants:', error);
            }
        };
        fetchVariants();
        createScriptTag();
    }, []);

    //Product Selection Logic
    const ProductSelectionSection = Object.keys(shopProducts).length === 0 ? (
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
                                                id={id}
                                                media={variantImage}
                                                accessibilityLabel={`View details for ${title}`}
                                                key={id}
                                            >
                                                <HorizontalStack blockAlign="center" wrap={false} align="space-between">
                                                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                        {title}
                                                    </Text>
                                                    <HorizontalStack gap="4">
                                                        <Button
                                                            onClick={() => handleCollapse(id)}
                                                            primary={showDescription !== id}
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
                                                        open={showDescription === id}
                                                        id="basic-collapsible"
                                                        transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                                        expandOnPrint
                                                    >
                                                        <AlphaCard>
                                                            <VerticalStack gap="10">
                                                                <DescriptionEditor variantData={item} />
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