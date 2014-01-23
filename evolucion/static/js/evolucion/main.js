(function(jQuery){
  jQuery( document ).ready( function() {
  
    (function(){
      this.evo = new Evolucion();
      this.evo.pro = this.pro = new Prose();
      this.evo.inf = this.inf = new Influences();
      this.evo.saf = this.saf = new StockAndFlow();
      this.evo.equ = this.equ = new Equations();
      this.evo.beh = this.beh = new Behaviors();
      
      //this.beh.graphs['graph'].redraw();
      
      //this.evo.dyn = new Dynamos(evo.fyn.list);
      
      $(window).resize(function(){
        evo.adjust();
      });
      
      $('#open').click(function(event){
        event.preventDefault();
        evo.actions.open();
      });
      
      $('#save').click(function(event){
        event.preventDefault();
        evo.actions.save();
      });
      
      $('#download').click(function(event){
        event.preventDefault();
        evo.actions.download();
      });
      
    })();
                
    function initToolbarBootstrapBindings() {
      var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 
            'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
            'Times New Roman', 'Verdana'],
            fontTarget = $('[title=Font]').siblings('.dropdown-menu');
      $.each(fonts, function (idx, fontName) {
          fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
      });
      $('a[title]').tooltip({container:'body'});
      $('.dropdown-menu input').click(function() {return false;})
        .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
        .keydown('esc', function () {this.value='';$(this).change();});

      $('[data-role=magic-overlay]').each(function () { 
        var overlay = $(this), target = $(overlay.data('target')); 
        overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
      });
      if ("onwebkitspeechchange"  in document.createElement("input")) {
        var editorOffset = $('#prose-editor').offset();
        $('#voiceBtn').css('position','absolute').offset({top: editorOffset.top, left: editorOffset.left+$('#prose-editor').innerWidth()-35});
      } else {
        $('#voiceBtn').hide();
      }
    };
    
    function showErrorAlert (reason, detail) {
      var msg='';
      if (reason==='unsupported-file-type') { msg = "Unsupported format " +detail; }
      else {
        console.log("error uploading file", reason, detail);
      }
      $('<div class="alert"> <button type="button" class="close" data-dismiss="alert">&times;</button>'+ 
       '<strong>File upload error</strong> '+msg+' </div>').prependTo('#alerts');
    };
    
    initToolbarBootstrapBindings();
      
    $('#prose-editor').wysiwyg({ fileUploadError: showErrorAlert} );

    window.prettyPrint && prettyPrint();
    
  });
}(jQuery));
