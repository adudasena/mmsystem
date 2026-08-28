package com.adudasena.mmsystem.repository;

import com.adudasena.mmsystem.model.Pagamento;
import com.adudasena.mmsystem.model.Produto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
}
