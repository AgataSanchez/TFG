$(function(){
    $('#orderModal').modal({
        keyboard: true,
        backdrop: "static",
        show:false,
        
    }).on('show', function(){
          var getIdFromRow = $(this).data('orderid');
        //make your ajax call populate items or what even you need
        $(this).find('#orderDetails').html($('<b> Order Id selected: ' + getIdFromRow  + '</b>'))
    });
    
    $(".table-striped").find('tr[data-target]').on('click', function(){
        //or do your operations here instead of on show of modal to populate values to modal.
         $('#orderModal').data('orderid',$(this).data('id'));
    });
    
});