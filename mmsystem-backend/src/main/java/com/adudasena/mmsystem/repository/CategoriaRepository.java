package com.adudasena.mmsystem.repository;
import com.adudasena.mmsystem.model.Categoria;
import com.adudasena.mmsystem.model.Cor;
import com.adudasena.mmsystem.model.Tamanho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository public interface CategoriaRepository extends JpaRepository<Categoria, Long> {}
