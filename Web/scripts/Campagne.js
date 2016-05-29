var Campagne = (function() {
    var options = {
        item: '<li class="row"><div class="idCampagne col-md-3"></div><div class="libelle col-md-6"></div>'
        //+ '<div class="contenu col-md-4"></div><div class="lien col-md-3"></div><div class="col-md-1 text-right">'
        + '<button class="btnUpdateCampagne btn btn-info btn-xs" data-toggle="modal" data-target="#modal">Modifier</button>'
        + '<button id="btnDeleteCampagne" class="btnDeleteCampagne btn btn-info btn-xs">Supprimer</button></div></li>'
    };

    var _campagnes, campagneList, li, idCampagne, libelle, objet, destinataire, idNewsletter, idGroupe;
    var _url = "../Web/index.php?page=campagnes";

    var _action;
    var modal = $('#modal');
    var btnSubmitCampagne = $('.btnSubmitCampagne');
    var btnUpdateCampagne = $('.btnUpdateCampagne');
    var btnNewCampagne = $('.btnNewCampagne');
    var btnList = $(".list");
    var btnDisplayCampagne = $('.hrefDisplayCampagne');
    var btnSendMailCampagne = $('.btnSendMailCampagne');

    var _loaderOn = function() {
        $('#loader').slideDown();
        $('#modalContentCampagne').slideUp();
    };
    var _loaderOff = function() {
        $('#loader').slideUp();
        $('#modalContentCampagne').slideDown();
        $("body").addClass('modal-open');
    };

    function _getCampagnes() {
        //_loaderOn();
       $.ajax({
                url : _url + "&action=list",
                type: 'POST'
            })
            .done(function(data) {
                //data = [{"id":"2","libelle":"BEN","prenom":"Mourad","mail":"mourad_ben@test.com"}, {"id":"3","nom":"Loue","prenom":"Arnauld","mail":"Ar.loue@test.net"},{"id":"5","nom":"toto","prenom":"titi","mail":"toto.titi@test-auth.fr"}];
                _campagnes = jQuery.parseJSON(data);
                if(_action =="create"){
                    console.log(_campagnes);
                    $.each( _campagnes, function( key, value ) {
                        if(key == _campagnes.length){
                            campagneList.add({idCampagne: value.idCampagne, libelle: value.libelle, objet: value.objet, idNewsletter: value.idNewsletter, idGroupe: value.idGroupe, destinataire: value.destinataire});
                        }
                    });
                }
                initList();
                //_loaderOff();
            })
            .always(function(){
                //_loaderOff();
            });
    };

    var _newsletters = null;
    var _groupes = null;
    function  _getNewslettersAndGroupes () {
        //_loaderOn();
        $.ajax({
                url : "../Web/index.php?page=newsletters" + "&action=list",
                type: 'POST'
            })
            .done(function(data) {
                _newsletters = jQuery.parseJSON(data);
                //console.log(_newsletters);

                $.each( _newsletters, function( key, value ) {
                     $('#inputSelectTemplate').append("<option data-id='"+value.idNewsletter+"'>"+value.nom+"</option>");
                });

                //_loaderOff();
            })
            .always(function(){
                //_loaderOff();
            });

        $.ajax({
                url : "../Web/index.php?page=groupes" + "&action=list",
                type: 'POST'
            })
            .done(function(data) {
                _groupes = jQuery.parseJSON(data);
                $.each( _groupes, function( key, value ) {
                    $('#inputSelectGroupe').append("<option data-id='"+value.idGroupe+"'>"+value.libelleGroupe+"</option>");
                });

                //_loaderOff();
            })
            .always(function(){
            //_loaderOff();
            });

    };

    function initList() {
        campagneList = new List('campagne-list', options, _campagnes);
    };

    function cleanForm() {
        $('#inputIdCampagne').val("");
        $('#inputLibelle').val("");
        //$('#inputContenu').val("");
        //$('#inputLien').val("");
        $('#modalContentCampagne').find(".key").prop('disabled', true);
    };

    function fillForm() {
        li = $('.fillSource');
        $('#inputIdCampagne').val(li.find('.idCampagne').text());
        $('#inputLibelle').val(li.find('.libelle').text());
        $('#modalContentCampagne').find(".key").prop('disabled', true);
        //var ed = tinyMCE.get('inputContenu');
        //ed.setContent(li.find('.contenu').text()); // contenu html
    };

    function _initEvents() {
        btnNewCampagne.click(function (e) {
            e.preventDefault();
            cleanForm();
            IHM.validateModal();
            _action = "create";
        });

        btnList.on("click",".btnUpdateCampagne", function(e) {
            e.preventDefault();
            $("li.fillSource").removeClass('fillSource');
            $(this).closest("li.row").addClass('fillSource');
            fillForm();
            IHM.validateModal();
            _action = "update";
        });

        btnList.on("click",".btnSendCampagne", function(e) {
            e.preventDefault();
            clearForm();
            IHM.validateModal();
            _action = "send";
        });

        btnSendMailCampagne.click(function(e) {
            e.preventDefault();
            $("li.fillSource").removeClass('fillSource');
            $(this).closest("li.row").addClass('fillSource');
            fillForm();
            IHM.validateModal();
            _action = "send";
        });

        btnList.on("click",".btnDeleteCampagne", function(e) {
            e.preventDefault();
            //var contentPanelId = $(e.target)[0].id;
            //console.log(contentPanelId);
            $("li.fillSource").removeClass('fillSource');
            $(this).closest("li.row").addClass('fillSource');
            li = $('.fillSource');
            _action = "delete";
            idCampagne = li.find('.idCampagne').text();
            var modal = bootbox.confirm({
                //title: "Suppression du mail "+nomSelectUser,
                message: "Êtes-vous sûr ?",
                callback: function (result) {
                    //Example.show("Hello");

                }
            });

            modal.on('click', '.btn-primary', function () {
                //_loaderOn();
                Ajax.now({
                        url:  _url + "&action=" + _action + '&idCampagne=' + idCampagne,
                        type: 'POST',
                        data : {
                            idCampagne: idCampagne
                        }
                        //context: document.body
                    })
                    .done(function () {
                        bootbox.alert("Suppression ok.");
                        campagneList.remove({"idCampagne": idCampagne, "libelle": libelle, "objet": objet, "idNewsletter": idNewsletter, "idGroupe": idGroupe, "destinataire": destinataire});
                        _getCampagnes();
                        modal.hide();
                        //_loaderOff();
                    })
                    .always(function() {
                    //_loaderOff();
                    });
                    
            });
        });

        btnSubmitCampagne.click(function() {
            idCampagne = $('#inputIdCampagne').val();
            libelle = $('#inputLibelle').val();
            objet = $('#inputObjet').val();
            destinataire = $('#inputDestinataire').val();
            idNewsletter = $( "#inputSelectTemplate option:selected" ).data('id');
            idGroupe = $('#inputSelectGroupe option:selected').data('id');

            if(libelle == "") {
                bootbox.alert('Libelle est obligatoire !');
                //cleanForm();
                IHM.validateModal();
                return "";
            }
            var data = {
                idCampagne : idCampagne,
                    libelleCampagne : libelle,
                    objetCampagne : objet,
                    idNewsletter : idNewsletter,
                    idGroupe : idGroupe,
                    destinataire : destinataire
            }

            //_loaderOn();
            Ajax.now({
                    //csrf: true,
                    url : _url + "&action=" + _action +  ((_action === 'update') ? '&idCampagne=' + idCampagne : ''),
                    type: 'POST',
                    data : {
                        idCampagne : idCampagne,
                        libelleCampagne : libelle,
                        objetCampagne : objet,
                        idNewsletter : idNewsletter,
                        idGroupe : idGroupe,
                        destinataire : destinataire
                    }
                })
                .done(function(data) {
                   // //_loaderOn();
                    switch(_action) {
                        case "update":
                            var li = $('.fillSource');
                            li.find('.libelle').text(libelle);
                            bootbox.alert("Mise à jour ok.");
                            modal.hide();

                            //tinyMCE.triggerSave();  //  pour la modification du template
                            //_getCampagnes();
                            break;

                        case "create":
                            bootbox.alert("Enregistrement ok.");
                            modal.hide();
                            _getCampagnes();
                            break;

                        case "send":
                            bootbox.alert("Mail envoyé.");
                            modal.hide();
                            ////_loaderOff();
                            break;
                    }
                    //_loaderOff();
                 })
                .always(function() {
                    //_loaderOff();
                 });

        });

        btnDisplayCampagne.click(function() {
            idCampagne = $('.hrefDisplayCampagne').data('id');
            //console.log("display campagne : "+idCampagne);

            //$(".afficheCampagne").append("<p>TEST</p>");

            /*Ajax.now({
                    //csrf: true,
                    url : _url + '&action=read&idCampagne=' + idCampagne,
                    type: 'POST',
                    data : {
                        idCampagne: idCampagne
                    }
                })
                .done(function(data) {
                    $.("#afficheCampagne").text("TEST");
                });
                */
        });
    };

    return {
        init : function() {
            //initList();
            _getCampagnes();
            _initEvents();
            _getNewslettersAndGroupes();
        }
    };
})();
$(document).ready(Campagne.init());
