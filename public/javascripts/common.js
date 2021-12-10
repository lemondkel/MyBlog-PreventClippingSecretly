function startBot() {
  $.ajax({
    url: '/2',
    data : {
      id : $('#id').val()
    },
    beforeSend : function () {

    },
    success : function (data) {
      console.log(data);
    },
    error : function (e) {
      console.log(e);
    },
    complete : function () {

    }
  })
}
