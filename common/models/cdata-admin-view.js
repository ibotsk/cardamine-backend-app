'use strict';

const REFRESH_MATERIALIZED_VIEW_SQL = 'SELECT refresh_v_cdata_for_admin()';

module.exports = function (Cdataadminview) {
  Cdataadminview.refresh = async () => {
    const dataSource = Cdataadminview.dataSource;

    return new Promise((resolve, reject) => (
      dataSource.connector.query(REFRESH_MATERIALIZED_VIEW_SQL,
        undefined, (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(res);
        },
      )
    ));
  };

  Cdataadminview.remoteMethod(
    'refresh', {
      http: {
        verb: 'post',
        path: '/refresh',
      },
      returns: {},
    }
  );
};
