if (window.jQuery) {
    $(document).ready(function () {
        let variant_ids = [];
        if (window.location.href.includes('/products')) {
            let forwardingAddress;
            let shopname;
            $('script').each(function (i, e) {
                var src = $(e).attr('src');
                if (typeof (src) === 'string') {
                    if (src.includes('variants-script.js')) {
                        var pathArray = src.split('/');
                        var protocol = pathArray[0];
                        var host = pathArray[2];
                        var url = protocol + '//' + host;
                        forwardingAddress = url;
                        var ExtractShopArray = src.split('=');
                        shopname = ExtractShopArray[1];
                    }
                }
            });
            const request_url = forwardingAddress + '/api/get/variantids?host=' + shopname + '&shop=' + shopname;
            $.ajax({
                method: 'GET',
                url: request_url,
                crossDomain: true,
                dataType: "json",
                success: function (response) {
                    if (response !== null) {
                        $(".selector-wrapper").change(function () {
                            const store_front_selected_variant_id = $(".product-variants").val();
                            const matching_variant_id = response.variantIds.filter((variantid) => {
                                variantid = variantid.split("/").pop();
                                return variantid === store_front_selected_variant_id;
                            })
                            if (matching_variant_id.length !== 0) {
                                const get_description_url = forwardingAddress + '/api/get/description?host=' + shopname + '&shop=' + shopname + '&variant_id=' + matching_variant_id[0];
                                $.ajax({
                                    method: 'GET',
                                    url: get_description_url,
                                    crossDomain: true,
                                    dataType: "json",
                                    success: function (data) {
                                        if (data !== null || data !== '') {
                                            $(`<div class="extra-description">${data}</div>`).insertAfter(".addToCartForm");
                                        }
                                    },
                                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                                        console.log("error");
                                    }
                                });
                            } else {
                                $(".extra-description").remove();
                            }
                        });

                        const store_front_selected_variant_id = $(".product-variants").val();
                        const matching_variant_id = response.variantIds.filter((variantid) => {
                            variantid = variantid.split("/").pop();
                            return variantid === store_front_selected_variant_id;
                        })
                        if (matching_variant_id.length !== 0) {
                            const get_description_url = forwardingAddress + '/api/get/description?host=' + shopname + '&shop=' + shopname + '&variant_id=' + matching_variant_id[0];
                            $.ajax({
                                method: 'GET',
                                url: get_description_url,
                                crossDomain: true,
                                dataType: "json",
                                success: function (data) {
                                    if (data !== null || data !== '') {
                                        const blobUrl = URL.createObjectURL("blob:https://shares-optics-systematic-post.trycloudflare.com/56974692-3b89-49f0-b34d-e756546a857e");

                                        $(`<div class="extra-description">${data}</div>`).insertAfter(".addToCartForm");
                                        var blobUrl = "blob:https://shares-optics-systematic-post.trycloudflare.com/56974692-3b89-49f0-b34d-e756546a857e";

                                        // Fetch the image as a blob
                                        fetch(blobUrl)
                                            .then(response => response.blob())
                                            .then(blob => {
                                                // Create a FileReader object
                                                var reader = new FileReader();

                                                // Read the blob as data URL
                                                reader.readAsDataURL(blob);

                                                // When reading is complete
                                                reader.onloadend = function () {
                                                    // Get the data URL representing the blob
                                                    var dataUrl = reader.result;

                                                    // Create an image element and set its src to the data URL
                                                    var img = document.createElement('img');
                                                    img.src = dataUrl;

                                                    // Append the image to the document body or any desired container
                                                    $(`${img}`).insertAfter(".addToCartForm");
                                                };
                                            })
                                            .catch(error => {
                                                console.error('Error fetching blob:', error);
                                            });
                                    }
                                },
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                    console.log("error");
                                }
                            });
                        } else {
                            $(".extra-description").remove();
                        }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("error");
                }
            });


        }
    });

    //     //console.log(string.includes(substring));
    // });

    //     console.log(request_url);
    //     $.ajax({
    //         type: 'GET',
    //         url: request_url,
    //         crossDomain: true,
    //         dataType: "json",
    //         success: function(data) {

    //             $('body').append('<div class="annoucemnent-bar-container">'+
    //             '<p class="annoucement-bar-text">'+ data[0].annoucement_text +'</p>'+
    //             '</div>')
    //         },
    //         error: function(XMLHttpRequest, textStatus, errorThrown) { 
    //             console.log('error');
    //         }
    //     });

    //  $('head').append('<link rel="stylesheet" type="text/css" href="'+ forwardingAddress +'/static/Stylesheets/app.css">');

}
else {
    console.log('No Jquery File added till yet');
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js';
    head.appendChild(script);
    if (window.jQuery) {
        console.log('now Jquery is added ');
    }

}